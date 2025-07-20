import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface BatchProgressProps {
  current: number;
  total: number;
  currentWord: string;
  successful: number;
  failed: number;
  skipped: number;
  duplicates: number;
  isProcessing: boolean;
}

export function BatchProgress({
  current,
  total,
  currentWord,
  successful,
  failed,
  skipped,
  duplicates,
  isProcessing
}: BatchProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const remaining = total - current;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{current} of {total} words</span>
            <span>{remaining} remaining</span>
          </div>
        </div>

        {/* Current Word */}
        {isProcessing && currentWord && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Currently processing:</span>
            <Badge variant="outline" className="font-mono">
              {currentWord}
            </Badge>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Successful:</span>
            <Badge variant="secondary" className="ml-auto">
              {successful}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            <span>Failed:</span>
            <Badge variant="secondary" className="ml-auto">
              {failed}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span>Skipped:</span>
            <Badge variant="secondary" className="ml-auto">
              {skipped}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-orange-500" />
            <span>Duplicates:</span>
            <Badge variant="secondary" className="ml-auto">
              {duplicates}
            </Badge>
          </div>
        </div>

        {/* Processing Speed */}
        {isProcessing && current > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Processing at ~{Math.round(current / (Date.now() / 1000))} words/second
          </div>
        )}
      </CardContent>
    </Card>
  );
} 