import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ResetDatabaseButtonProps {
  onReset: () => Promise<void>;
  isAdmin: boolean;
}

export function ResetDatabaseButton({ onReset, isAdmin }: ResetDatabaseButtonProps) {
  const [isResetting, setIsResetting] = useState(false);

  if (!isAdmin) return null;

  const handleReset = async () => {
    setIsResetting(true);
    await onReset();
    setIsResetting(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="w-4 h-4" />
          Réinitialiser la base
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Réinitialiser la base de données ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les données importées (utilisateurs, commandes, plats, portefeuilles) seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isResetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResetting ? 'Suppression...' : 'Oui, tout supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
