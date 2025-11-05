'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getAllTemplates, getTemplatesByCategory, NewsletterTemplate } from '@/lib/templates'
import Navbar from '@/components/Navbar'

export default function TemplatesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null)
  const [templateContent, setTemplateContent] = useState<{ [key: string]: string }>({})
  const [generatedNewsletter, setGeneratedNewsletter] = useState('')
  const router = useRouter()

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'tech', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'casual', name: 'Casual' },
    { id: 'professional', name: 'Professional' },
    { id: 'creative', name: 'Creative' }
  ]

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }

    checkUser()
  }, [router])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setTemplates(getAllTemplates())
    } else {
      setTemplates(getTemplatesByCategory(selectedCategory))
    }
  }, [selectedCategory])

  const handleTemplateSelect = (template: NewsletterTemplate) => {
    setSelectedTemplate(template)
    setTemplateContent({})
    setGeneratedNewsletter('')
    
    // Initialize content with placeholders
    const initialContent: { [key: string]: string } = {}
    template.structure.forEach(section => {
      initialContent[section.id] = section.placeholder
    })
    setTemplateContent(initialContent)
  }

  const handleContentChange = (sectionId: string, value: string) => {
    setTemplateContent(prev => ({
      ...prev,
      [sectionId]: value
    }))
  }

  const generateFromTemplate = () => {
    if (!selectedTemplate) return

    const { generateNewsletterFromTemplate } = require('@/lib/templates')
    const newsletter = generateNewsletterFromTemplate(selectedTemplate, templateContent)
    setGeneratedNewsletter(newsletter)
  }

  const saveNewsletter = () => {
    if (!generatedNewsletter.trim()) {
      alert('Please generate a newsletter first')
      return
    }
    
    // Here you would typically save to database
    alert('Newsletter saved! (This is a mock - implement actual saving)')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Newsletter Templates</h1>
          
          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Choose Template Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Selection */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-black mb-4">Available Templates</h2>
                <div className="space-y-4">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h3 className="font-semibold text-black">{template.name}</h3>
                      <p className="text-sm text-black mt-1">{template.description}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Content Editor */}
              {selectedTemplate && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">
                    Edit {selectedTemplate.name}
                  </h2>
                  <div className="space-y-4">
                    {selectedTemplate.structure.map(section => (
                      <div key={section.id}>
                        <label className="block text-sm font-medium text-black mb-2">
                          {section.name}
                          {section.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <textarea
                          value={templateContent[section.id] || ''}
                          onChange={(e) => handleContentChange(section.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={section.name === 'Greeting' || section.name === 'Closing' ? 2 : 4}
                          placeholder={section.placeholder}
                          maxLength={section.maxLength}
                        />
                        {section.maxLength && (
                          <div className="text-xs text-gray-500 mt-1">
                            {templateContent[section.id]?.length || 0} / {section.maxLength} characters
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={generateFromTemplate}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Generate Newsletter
                  </button>
                </div>
              )}
            </div>

            {/* Generated Newsletter Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">Generated Newsletter</h2>
                {generatedNewsletter && (
                  <button
                    onClick={saveNewsletter}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Save Newsletter
                  </button>
                )}
              </div>
              
              {generatedNewsletter ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-black text-sm font-mono">
                    {generatedNewsletter}
                  </pre>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-gray-500">
                  <p>Select a template and fill in the content to generate your newsletter</p>
                </div>
              )}
            </div>
          </div>

          {/* Template Info */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">About Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-2">Template Features</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• Pre-structured newsletter layouts</li>
                  <li>• Category-specific designs</li>
                  <li>• Customizable content sections</li>
                  <li>• Professional formatting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">How to Use</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• Choose a template category</li>
                  <li>• Select your preferred template</li>
                  <li>• Fill in the content sections</li>
                  <li>• Generate and save your newsletter</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

