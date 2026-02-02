import { useState } from 'react';
import { Check, ChevronsUpDown, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RestaurantFilterProps {
  restaurants: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function RestaurantFilter({ restaurants, selected, onSelectionChange }: RestaurantFilterProps) {
  const [open, setOpen] = useState(false);

  const toggleRestaurant = (restaurant: string) => {
    if (selected.includes(restaurant)) {
      onSelectionChange(selected.filter(r => r !== restaurant));
    } else {
      onSelectionChange([...selected, restaurant]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className={cn(!selected.length && 'text-muted-foreground')}>
                {selected.length > 0 
                  ? `${selected.length} restaurant${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}`
                  : 'Tous les restaurants'
                }
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un restaurant..." />
            <CommandList>
              <CommandEmpty>Aucun restaurant trouvé.</CommandEmpty>
              <CommandGroup>
                {restaurants.map((restaurant) => (
                  <CommandItem
                    key={restaurant}
                    value={restaurant}
                    onSelect={() => toggleRestaurant(restaurant)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(restaurant) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">{restaurant}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.slice(0, 3).map((restaurant) => (
            <Badge 
              key={restaurant} 
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
              onClick={() => toggleRestaurant(restaurant)}
            >
              {restaurant.length > 15 ? `${restaurant.slice(0, 15)}...` : restaurant}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {selected.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selected.length - 3} autres
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-muted-foreground hover:text-destructive"
            onClick={clearAll}
          >
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}
