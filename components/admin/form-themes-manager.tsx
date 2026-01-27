'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Save,
  RefreshCw,
  Calendar,
  Eye,
  EyeOff,
  FileText,
  Sliders
} from 'lucide-react'

// Tipos de pergunta disponíveis
const QUESTION_TYPES = [
  { value: 'radio', label: 'Escolha única (Radio)' },
  { value: 'checkbox', label: 'Múltipla escolha (Checkbox)' },
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'scale', label: 'Escala numérica' },
  { value: 'select', label: 'Seleção (Dropdown)' },
]

type FormTheme = {
  id: string
  name: string
  displayName: string
  description: string | null
  icon: string | null
  color: string
  active: boolean
  order: number
  seasonal: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
  _count?: {
    questions: number
    analyses: number
  }
}

type FormQuestion = {
  id: string
  themeId: string | null
  key: string
  label: string
  description: string | null
  type: string
  required: boolean
  order: number
  weight: number
  placeholder: string | null
  rows: number | null
  autoAdvance: boolean
  showIf: any
  isFixed: boolean
  fixedPosition: string | null
  options?: FormQuestionOption[]
}

type FormQuestionOption = {
  id: string
  value: string
  label: string
  hint: string | null
  icon: string | null
  color: string | null
  order: number
}

export function FormThemesManager() {
  const [themes, setThemes] = useState<FormTheme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [fixedQuestions, setFixedQuestions] = useState<FormQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'themes' | 'questions' | 'fixed'>('themes')
  const [error, setError] = useState<string | null>(null)
  
  // Modais
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingTheme, setEditingTheme] = useState<FormTheme | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(null)

  // Carregar temas
  const loadThemes = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/form-themes')
      if (response.ok) {
        const data = await response.json()
        setThemes(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || `Erro ${response.status}: ${response.statusText}`)
        console.error('Erro na API:', response.status, errorData)
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error)
      setError('Erro de conexão ao carregar temas')
    } finally {
      setLoading(false)
    }
  }

  // Carregar perguntas de um tema
  const loadQuestions = async (themeId: string) => {
    try {
      const response = await fetch(`/api/admin/form-questions?themeId=${themeId}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error)
    }
  }

  // Carregar perguntas fixas
  const loadFixedQuestions = async () => {
    try {
      const response = await fetch('/api/admin/form-questions?fixedOnly=true')
      if (response.ok) {
        const data = await response.json()
        setFixedQuestions(data)
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas fixas:', error)
    }
  }

  useEffect(() => {
    loadThemes()
    loadFixedQuestions()
  }, [])

  useEffect(() => {
    if (selectedTheme) {
      loadQuestions(selectedTheme)
    }
  }, [selectedTheme])

  // Deletar tema
  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este tema?')) return
    
    try {
      const response = await fetch(`/api/admin/form-themes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadThemes()
        if (selectedTheme === id) {
          setSelectedTheme(null)
          setQuestions([])
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao deletar tema')
      }
    } catch (error) {
      console.error('Erro ao deletar tema:', error)
      alert('Erro ao deletar tema')
    }
  }

  // Toggle ativo/inativo
  const handleToggleActive = async (theme: FormTheme) => {
    try {
      const response = await fetch(`/api/admin/form-themes/${theme.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !theme.active })
      })
      
      if (response.ok) {
        await loadThemes()
      }
    } catch (error) {
      console.error('Erro ao atualizar tema:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-400">Carregando formulários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
        <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-400 mb-2">Erro ao carregar formulários</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button onClick={loadThemes} className="bg-red-600 hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-500" />
          Gerenciar Formulários Temáticos
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setView('themes')}
            className={`${
              view === 'themes'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Temas
          </Button>
          <Button
            onClick={() => setView('fixed')}
            className={`${
              view === 'fixed'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Perguntas Fixas
          </Button>
        </div>
      </div>

      {/* Vista de Temas */}
      {view === 'themes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              {themes.length} tema(s) cadastrado(s)
            </p>
            <Button
              onClick={() => {
                setEditingTheme(null)
                setShowThemeModal(true)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Tema
            </Button>
          </div>

          {/* Lista de Temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <Card
                key={theme.id}
                className={`bg-gray-800 border-gray-700 p-6 ${
                  selectedTheme === theme.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">
                        {theme.displayName}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {theme.name}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(theme)}
                        className="p-1 h-auto"
                      >
                        {theme.active ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {theme.description && (
                    <p className="text-sm text-gray-400">
                      {theme.description}
                    </p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {theme.active && (
                      <Badge className="bg-green-900/30 text-green-400">
                        Ativo
                      </Badge>
                    )}
                    {theme.seasonal && (
                      <Badge className="bg-blue-900/30 text-blue-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        Sazonal
                      </Badge>
                    )}
                    {theme._count && (
                      <>
                        <Badge className="bg-purple-900/30 text-purple-400">
                          {theme._count.questions} perguntas
                        </Badge>
                        <Badge className="bg-gray-700 text-gray-300">
                          {theme._count.analyses} análises
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTheme(theme.id)
                        setView('questions')
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Sliders className="w-4 h-4 mr-1" />
                      Perguntas
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTheme(theme)
                        setShowThemeModal(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTheme(theme.id)}
                      disabled={theme._count && theme._count.analyses > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {themes.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Nenhum tema cadastrado ainda.
                <br />
                Crie seu primeiro tema para começar.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Vista de Perguntas do Tema */}
      {view === 'questions' && selectedTheme && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setView('themes')
                setSelectedTheme(null)
              }}
            >
              Voltar
            </Button>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {themes.find((t) => t.id === selectedTheme)?.displayName}
              </h3>
              <p className="text-sm text-gray-400">
                {questions.length} pergunta(s)
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingQuestion(null)
                setShowQuestionModal(true)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Pergunta
            </Button>
          </div>

          {/* Lista de Perguntas */}
          <div className="space-y-2">
            {questions.map((question, index) => (
              <Card key={question.id} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 font-mono text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">
                        {question.label}
                      </h4>
                      {question.required && (
                        <Badge className="bg-red-900/30 text-red-400 text-xs">
                          Obrigatória
                        </Badge>
                      )}
                      <Badge className="bg-blue-900/30 text-blue-400 text-xs">
                        {question.type}
                      </Badge>
                      <Badge className="bg-purple-900/30 text-purple-400 text-xs">
                        Peso: {question.weight}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {question.key}
                      {question.options && ` • ${question.options.length} opções`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingQuestion(question)
                        setShowQuestionModal(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!confirm('Deletar esta pergunta?')) return
                        try {
                          const res = await fetch(
                            `/api/admin/form-questions/${question.id}`,
                            { method: 'DELETE' }
                          )
                          if (res.ok) {
                            loadQuestions(selectedTheme)
                          }
                        } catch (error) {
                          console.error(error)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {questions.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 p-12 text-center">
              <Sliders className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                Nenhuma pergunta cadastrada ainda.
                <br />
                Adicione perguntas para este tema.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Vista de Perguntas Fixas */}
      {view === 'fixed' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Perguntas Fixas
              </h3>
              <p className="text-sm text-gray-400">
                Aparecem em todos os temas • {fixedQuestions.length} pergunta(s)
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingQuestion(null)
                setShowQuestionModal(true)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Pergunta Fixa
            </Button>
          </div>

          {/* Implementação similar às perguntas do tema */}
          <div className="space-y-2">
            {fixedQuestions.map((question, index) => (
              <Card key={question.id} className="bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">
                        {question.label}
                      </h4>
                      <Badge className="bg-yellow-900/30 text-yellow-400 text-xs">
                        {question.fixedPosition === 'BEFORE' ? 'Antes' : 'Depois'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {question.key}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Tema */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => {
          setShowThemeModal(false)
          setEditingTheme(null)
        }}
        theme={editingTheme}
        onSave={async (themeData) => {
          setSaving(true)
          try {
            const url = editingTheme 
              ? `/api/admin/form-themes/${editingTheme.id}` 
              : '/api/admin/form-themes'
            
            const response = await fetch(url, {
              method: editingTheme ? 'PATCH' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(themeData)
            })

            if (response.ok) {
              await loadThemes()
              setShowThemeModal(false)
              setEditingTheme(null)
            } else {
              const error = await response.json()
              alert(error.error || 'Erro ao salvar tema')
            }
          } catch (error) {
            console.error('Erro ao salvar tema:', error)
            alert('Erro ao salvar tema')
          } finally {
            setSaving(false)
          }
        }}
        saving={saving}
      />

      {/* Modal de Pergunta */}
      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false)
          setEditingQuestion(null)
        }}
        question={editingQuestion}
        themeId={view === 'fixed' ? null : selectedTheme}
        isFixed={view === 'fixed'}
        onSave={async (questionData) => {
          setSaving(true)
          try {
            const url = editingQuestion 
              ? `/api/admin/form-questions/${editingQuestion.id}` 
              : '/api/admin/form-questions'
            
            const response = await fetch(url, {
              method: editingQuestion ? 'PATCH' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(questionData)
            })

            if (response.ok) {
              if (view === 'fixed') {
                await loadFixedQuestions()
              } else if (selectedTheme) {
                await loadQuestions(selectedTheme)
              }
              setShowQuestionModal(false)
              setEditingQuestion(null)
            } else {
              const error = await response.json()
              alert(error.error || 'Erro ao salvar pergunta')
            }
          } catch (error) {
            console.error('Erro ao salvar pergunta:', error)
            alert('Erro ao salvar pergunta')
          } finally {
            setSaving(false)
          }
        }}
        saving={saving}
      />
    </div>
  )
}

// ============================================================================
// COMPONENTE: Modal de Tema
// ============================================================================
type ThemeModalProps = {
  isOpen: boolean
  onClose: () => void
  theme: FormTheme | null
  onSave: (data: Partial<FormTheme>) => Promise<void>
  saving: boolean
}

function ThemeModal({ isOpen, onClose, theme, onSave, saving }: ThemeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    icon: '',
    color: 'purple',
    active: true,
    order: 0,
    seasonal: false,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (theme) {
      setFormData({
        name: theme.name || '',
        displayName: theme.displayName || '',
        description: theme.description || '',
        icon: theme.icon || '',
        color: theme.color || 'purple',
        active: theme.active,
        order: theme.order || 0,
        seasonal: theme.seasonal || false,
        startDate: theme.startDate ? theme.startDate.split('T')[0] : '',
        endDate: theme.endDate ? theme.endDate.split('T')[0] : ''
      })
    } else {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        icon: '',
        color: 'purple',
        active: true,
        order: 0,
        seasonal: false,
        startDate: '',
        endDate: ''
      })
    }
  }, [theme, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    } as any)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {theme ? 'Editar Tema' : 'Novo Tema'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nome (slug)</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: relacionamento"
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Nome de Exibição</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="ex: Relacionamento"
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição opcional do tema"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Ícone (emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="ex: 💑"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Cor</Label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
              >
                <option value="purple">Roxo</option>
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="red">Vermelho</option>
                <option value="yellow">Amarelo</option>
                <option value="pink">Rosa</option>
                <option value="orange">Laranja</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Ordem</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="flex items-center gap-4 pt-8">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <Checkbox
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                />
                Ativo
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <Checkbox
                  checked={formData.seasonal}
                  onCheckedChange={(checked) => setFormData({ ...formData, seasonal: !!checked })}
                />
                Sazonal
              </label>
            </div>
          </div>

          {formData.seasonal && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-gray-300">Data de Início</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Data de Fim</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: Modal de Pergunta
// ============================================================================
type QuestionModalProps = {
  isOpen: boolean
  onClose: () => void
  question: FormQuestion | null
  themeId: string | null
  isFixed: boolean
  onSave: (data: any) => Promise<void>
  saving: boolean
}

function QuestionModal({ isOpen, onClose, question, themeId, isFixed, onSave, saving }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    type: 'radio',
    required: true,
    order: 0,
    weight: 50,
    placeholder: '',
    rows: 3,
    autoAdvance: true,
    isFixed: false,
    fixedPosition: 'BEFORE'
  })

  const [options, setOptions] = useState<Array<{
    value: string
    label: string
    hint: string
    icon: string
    color: string
  }>>([])

  useEffect(() => {
    if (question) {
      setFormData({
        key: question.key || '',
        label: question.label || '',
        description: question.description || '',
        type: question.type || 'radio',
        required: question.required,
        order: question.order || 0,
        weight: question.weight || 50,
        placeholder: question.placeholder || '',
        rows: question.rows || 3,
        autoAdvance: question.autoAdvance,
        isFixed: question.isFixed,
        fixedPosition: question.fixedPosition || 'BEFORE'
      })
      if (question.options) {
        setOptions(question.options.map(opt => ({
          value: opt.value,
          label: opt.label,
          hint: opt.hint || '',
          icon: opt.icon || '',
          color: opt.color || ''
        })))
      } else {
        setOptions([])
      }
    } else {
      setFormData({
        key: '',
        label: '',
        description: '',
        type: 'radio',
        required: true,
        order: 0,
        weight: 50,
        placeholder: '',
        rows: 3,
        autoAdvance: true,
        isFixed: isFixed,
        fixedPosition: 'BEFORE'
      })
      setOptions([])
    }
  }, [question, isOpen, isFixed])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data: any = {
      ...formData,
      themeId: isFixed ? null : themeId,
      isFixed: isFixed,
      options: ['radio', 'checkbox', 'select'].includes(formData.type) ? options.filter(o => o.value && o.label) : undefined
    }

    onSave(data)
  }

  const addOption = () => {
    setOptions([...options, { value: '', label: '', hint: '', icon: '', color: '' }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const needsOptions = ['radio', 'checkbox', 'select'].includes(formData.type)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {question ? 'Editar Pergunta' : isFixed ? 'Nova Pergunta Fixa' : 'Nova Pergunta'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Key (identificador)</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="ex: motivo_busca"
                className="bg-gray-700 border-gray-600"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tipo</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
              >
                {QUESTION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Pergunta (label)</Label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="ex: O que te trouxe aqui hoje?"
              className="bg-gray-700 border-gray-600"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Descrição/Ajuda (opcional)</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Texto de ajuda abaixo da pergunta"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          {formData.type === 'textarea' && (
            <div className="space-y-2">
              <Label className="text-gray-300">Placeholder</Label>
              <Input
                value={formData.placeholder}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="Texto de exemplo no campo"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Ordem</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Peso (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 50 })}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            {isFixed && (
              <div className="space-y-2">
                <Label className="text-gray-300">Posição</Label>
                <select
                  value={formData.fixedPosition}
                  onChange={(e) => setFormData({ ...formData, fixedPosition: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="BEFORE">Antes das perguntas</option>
                  <option value="AFTER">Depois das perguntas</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <Checkbox
                checked={formData.required}
                onCheckedChange={(checked) => setFormData({ ...formData, required: !!checked })}
              />
              Obrigatória
            </label>
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <Checkbox
                checked={formData.autoAdvance}
                onCheckedChange={(checked) => setFormData({ ...formData, autoAdvance: !!checked })}
              />
              Avançar automaticamente
            </label>
          </div>

          {/* Opções para radio/checkbox/select */}
          {needsOptions && (
            <div className="space-y-3 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Opções de resposta</Label>
                <Button type="button" size="sm" onClick={addOption} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {options.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhuma opção adicionada. Clique em "Adicionar" para criar opções.
                </p>
              )}

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                    <Input
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      placeholder="Valor"
                      className="bg-gray-700 border-gray-600 w-32"
                    />
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      placeholder="Texto exibido"
                      className="bg-gray-700 border-gray-600 flex-1"
                    />
                    <Input
                      value={option.hint}
                      onChange={(e) => updateOption(index, 'hint', e.target.value)}
                      placeholder="Dica (opcional)"
                      className="bg-gray-700 border-gray-600 w-40"
                    />
                    <Button 
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
