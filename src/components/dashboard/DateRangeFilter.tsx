import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/madifood';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      onDateRangeChange({
        start: range.from || null,
        end: range.to || null,
      });
    }
  };

  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) {
      return 'Sélectionner une période';
    }
    
    const startStr = dateRange.start 
      ? format(dateRange.start, 'dd MMM yyyy', { locale: fr }) 
      : '';
    const endStr = dateRange.end 
      ? format(dateRange.end, 'dd MMM yyyy', { locale: fr }) 
      : '';
    
    if (startStr && endStr) {
      return `${startStr} - ${endStr}`;
    }
    
    return startStr || endStr;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal w-full',
            !dateRange.start && !dateRange.end && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.start || undefined}
          selected={{
            from: dateRange.start || undefined,
            to: dateRange.end || undefined,
          }}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={fr}
        />
      </PopoverContent>
    </Popover>
  );
}
