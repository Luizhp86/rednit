'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'

type DemoSchedulerProps = {
  isOpen: boolean
  onClose: () => void
}

export function DemoScheduler({ isOpen, onClose }: DemoSchedulerProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  
  // Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Dias vazios no início
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }
  
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Não permitir datas passadas
    if (date < today) return true
    
    // Não permitir finais de semana
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return true
    
    return false
  }
  
  // Buscar horários disponíveis quando selecionar data
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])
  
  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true)
    try {
      const res = await fetch(`/api/demos?date=${date.toISOString()}`)
      const data = await res.json()
      
      if (res.ok) {
        setAvailableSlots(data.availableSlots || [])
      }
    } catch (err) {
      console.error('Erro ao buscar horários:', err)
    } finally {
      setLoadingSlots(false)
    }
  }
  
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Selecione uma data e horário')
      return
    }
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Criar data com horário selecionado
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(hours, minutes, 0, 0)
      
      const res = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledAt: scheduledAt.toISOString(),
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Erro ao agendar demonstração')
        return
      }
      
      setSuccess(true)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setSuccess(false)
    setError('')
    setFormData({ name: '', email: '', phone: '', company: '' })
    onClose()
  }
  
  if (!isOpen) return null
  
  const days = getDaysInMonth(currentMonth)
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Agendar Demonstração</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h3>
            <p className="text-gray-600 mb-4">
              Sua demonstração foi agendada para:
            </p>
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-purple-900 font-semibold">
                {selectedDate?.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: 'long' 
                })}
              </p>
              <p className="text-2xl font-bold text-purple-600">{selectedTime}</p>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Você receberá um email de confirmação em breve.
            </p>
            <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700 text-white">
              Fechar
            </Button>
          </div>
        ) : (
          <div className="p-6">
            {/* Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            
            {/* Step 1: Selecionar Data */}
            {step === 1 && (
              <div>
                <h3 className="text-center font-semibold text-gray-900 mb-4">
                  Selecione uma data
                </h3>
                
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {days.map((day, index) => (
                    <button
                      key={index}
                      disabled={!day || isDateDisabled(day)}
                      onClick={() => day && !isDateDisabled(day) && setSelectedDate(day)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                        ${!day ? 'invisible' : ''}
                        ${day && isDateDisabled(day) ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${day && !isDateDisabled(day) && selectedDate?.toDateString() === day.toDateString()
                          ? 'bg-purple-600 text-white font-semibold'
                          : day && !isDateDisabled(day)
                            ? 'hover:bg-purple-100 text-gray-700'
                            : ''
                        }
                      `}
                    >
                      {day?.getDate()}
                    </button>
                  ))}
                </div>
                
                <p className="text-center text-xs text-gray-500 mb-4">
                  Disponível de segunda a sexta
                </p>
                
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedDate}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continuar
                </Button>
              </div>
            )}
            
            {/* Step 2: Selecionar Horário */}
            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                
                <h3 className="text-center font-semibold text-gray-900 mb-2">
                  Selecione um horário
                </h3>
                <p className="text-center text-sm text-gray-500 mb-4">
                  {selectedDate?.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: '2-digit', 
                    month: 'long' 
                  })}
                </p>
                
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Nenhum horário disponível para esta data</p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-purple-600 hover:text-purple-700 text-sm mt-2"
                    >
                      Escolher outra data
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-6 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`
                            py-3 rounded-lg text-sm font-medium transition-all
                            ${selectedTime === slot
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 hover:bg-purple-100 text-gray-700'
                            }
                          `}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedTime}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Continuar
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {/* Step 3: Dados do Contato */}
            {step === 3 && (
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                
                <h3 className="text-center font-semibold text-gray-900 mb-2">
                  Seus dados
                </h3>
                <div className="bg-purple-50 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm text-purple-700">
                    {selectedDate?.toLocaleDateString('pt-BR', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: 'short' 
                    })} às <strong>{selectedTime}</strong>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Nome *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-700">Telefone *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="11999999999"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="text-gray-700">Empresa / Consultório (opcional)</Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da empresa ou consultório"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Agendando...
                    </span>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
