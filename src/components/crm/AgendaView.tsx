import { useState, useMemo } from 'react';
import { useCRM } from '@/contexts/CRMContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, User, Building, Trash2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiltersPopover } from './FiltersPopover';

type ViewPeriod = 'day' | 'week' | 'month';

export function AgendaView() {
  const { state, addMeeting, deleteMeeting } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: '', time: '09:00', leadId: '' });

  // Navigation
  const navigatePrevious = () => {
    if (viewPeriod === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (viewPeriod === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const navigateNext = () => {
    if (viewPeriod === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (viewPeriod === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  // Date range calculation
  const daysToShow = useMemo(() => {
    if (viewPeriod === 'day') {
      return [currentDate];
    } else if (viewPeriod === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  }, [currentDate, viewPeriod]);

  // Pad days to start on Sunday (only for month view)
  const paddedDays = useMemo(() => {
    if (viewPeriod === 'month') {
      const startPadding = daysToShow[0].getDay();
      return [...Array(startPadding).fill(null), ...daysToShow];
    }
    return daysToShow;
  }, [daysToShow, viewPeriod]);

  const meetingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return state.meetings.filter(m => m.date === dateStr);
  };

  const selectedDateMeetings = selectedDate ? meetingsForDate(selectedDate) : [];

  const getLeadInfo = (leadId: string) => {
    return state.leads.find(l => l.id === leadId);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setNewMeetingOpen(true);
  };

  const handleAddMeeting = () => {
    if (!selectedDate || !newMeeting.title.trim()) return;
    
    addMeeting({
      title: newMeeting.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: newMeeting.time,
      leadId: newMeeting.leadId || undefined,
    });
    
    setNewMeeting({ title: '', time: '09:00', leadId: '' });
    setNewMeetingOpen(false);
  };

  const upcomingMeetings = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.meetings
      .filter(m => m.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [state.meetings]);

  const getHeaderTitle = () => {
    if (viewPeriod === 'day') {
      return format(currentDate, "dd 'de' MMMM yyyy", { locale: ptBR });
    } else if (viewPeriod === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale: ptBR });
  };

  return (
    <div className="animate-fade-in">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Select value={viewPeriod} onValueChange={(v: ViewPeriod) => setViewPeriod(v)}>
            <SelectTrigger className="w-[120px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
          <FiltersPopover />
        </div>
        <Button size="sm" onClick={() => { setSelectedDate(new Date()); setNewMeetingOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Reunião
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {getHeaderTitle()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week headers - only for week/month view */}
          {viewPeriod !== 'day' && (
            <div className={`grid gap-1 mb-2 ${viewPeriod === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Calendar grid */}
          {viewPeriod === 'day' ? (
            // Day view - show hours
            <div className="space-y-2">
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                const hourMeetings = meetingsForDate(currentDate).filter(m => {
                  const meetingHour = parseInt(m.time.split(':')[0]);
                  return meetingHour === hour;
                });
                return (
                  <div
                    key={hour}
                    onClick={() => handleDateClick(currentDate)}
                    className="flex gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-12">{hour}:00</span>
                    <div className="flex-1">
                      {hourMeetings.map(meeting => (
                        <div key={meeting.id} className="text-sm text-primary font-medium">
                          {meeting.time} - {meeting.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Week/Month grid view
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, idx) => {
                if (!day) return <div key={`pad-${idx}`} className="aspect-square" />;
                
                const meetings = meetingsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-1 rounded-xl border transition-all duration-200 flex flex-col items-center justify-start gap-0.5 ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary'
                        : today
                        ? 'bg-accent border-accent-foreground/20'
                        : 'bg-card/50 border-border/40 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <span className={`text-sm font-medium ${today && !isSelected ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {meetings.length > 0 && (
                      <div className="flex gap-0.5">
                        {meetings.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Selected Date & Upcoming */}
        <div className="space-y-4">
          {/* Selected Date Meetings */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
              </h3>
              {selectedDate && (
                <Button size="sm" variant="outline" onClick={() => setNewMeetingOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              )}
            </div>

            {selectedDate ? (
              selectedDateMeetings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateMeetings.map(meeting => {
                    const lead = meeting.leadId ? getLeadInfo(meeting.leadId) : null;
                    return (
                      <div key={meeting.id} className="p-3 rounded-xl bg-card/60 border border-border/40 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">{meeting.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{meeting.time}</span>
                            </div>
                            {lead && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                                <User className="h-3 w-3" />
                                <span>{lead.name}</span>
                                {lead.company && (
                                  <>
                                    <Building className="h-3 w-3 ml-1" />
                                    <span>{lead.company}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            onClick={() => deleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma reunião agendada
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Clique em uma data para agendar
              </p>
            )}
          </div>

          {/* Upcoming Meetings */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Próximas Reuniões
            </h3>
            
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-2">
                {upcomingMeetings.map(meeting => {
                  const lead = meeting.leadId ? getLeadInfo(meeting.leadId) : null;
                  return (
                    <div key={meeting.id} className="p-2 rounded-lg bg-card/40 border border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{meeting.title}</span>
                        <span className="text-xs text-muted-foreground">{meeting.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(meeting.date), "dd/MM", { locale: ptBR })}
                        {lead && ` • ${lead.name}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma reunião agendada
              </p>
            )}
          </div>
        </div>
      </div>

      {/* New Meeting Dialog */}
      <Dialog open={newMeetingOpen} onOpenChange={setNewMeetingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Reunião</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {selectedDate && (
              <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                📅 {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="Ex: Reunião de diagnóstico"
                value={newMeeting.title}
                onChange={e => setNewMeeting(m => ({ ...m, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Horário</label>
              <Input
                type="time"
                value={newMeeting.time}
                onChange={e => setNewMeeting(m => ({ ...m, time: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lead (opcional)</label>
              <select
                className="input-crm w-full"
                value={newMeeting.leadId}
                onChange={e => setNewMeeting(m => ({ ...m, leadId: e.target.value }))}
              >
                <option value="">(Nenhum)</option>
                {state.leads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleAddMeeting} className="w-full">
              Agendar Reunião
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
