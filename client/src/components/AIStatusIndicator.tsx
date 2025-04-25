import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface AIStatusProps {
  compact?: boolean;
  showLabels?: boolean;
}

interface AIServiceStatus {
  openai: {
    status: 'active' | 'error' | 'unknown';
    message?: string;
  };
  perplexity: {
    status: 'active' | 'error' | 'unknown';
    message?: string;
  };
  anthropic: {
    status: 'active' | 'error' | 'unknown';
    message?: string;
  };
}

export default function AIStatusIndicator({ compact = false, showLabels = true }: AIStatusProps) {
  // Fetch AI services status
  const { data: aiStatus, isLoading, error } = useQuery({
    queryKey: ['/api/ai/status'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/ai/status');
        const data = await response.json();
        return data as AIServiceStatus;
      } catch (err) {
        console.error('Error fetching AI status:', err);
        return {
          openai: { status: 'unknown' },
          perplexity: { status: 'unknown' },
          anthropic: { status: 'unknown' }
        } as AIServiceStatus;
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });

  // Generate status icons and colors
  const getStatusIcon = (status: 'active' | 'error' | 'unknown', size: number = 16) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={size} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={size} className="text-red-500" />;
      default:
        return <HelpCircle size={size} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: 'active' | 'error' | 'unknown') => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getTooltipContent = (service: string, status?: 'active' | 'error' | 'unknown', message?: string) => {
    return (
      <div className="space-y-1">
        <p className="font-medium">{service} API Status: {getStatusText(status || 'unknown')}</p>
        {message && <p className="text-xs opacity-80">{message}</p>}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse w-3 h-3 rounded-full bg-gray-300"></div>
        {!compact && <span className="text-sm text-gray-400">Checking AI services...</span>}
      </div>
    );
  }

  // Error state
  if (error || !aiStatus) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        {!compact && <span className="text-sm text-gray-400">Status check failed</span>}
      </div>
    );
  }

  // Compact view - just shows dots
  if (compact) {
    return (
      <div className="flex items-center space-x-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {getStatusIcon(aiStatus.openai.status, 14)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {getTooltipContent('OpenAI', aiStatus.openai.status, aiStatus.openai.message)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {getStatusIcon(aiStatus.perplexity.status, 14)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {getTooltipContent('Perplexity', aiStatus.perplexity.status, aiStatus.perplexity.message)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {getStatusIcon(aiStatus.anthropic.status, 14)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {getTooltipContent('Claude', aiStatus.anthropic.status, aiStatus.anthropic.message)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Full view with labels
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div className="flex items-center space-x-2">
        {getStatusIcon(aiStatus.openai.status)}
        {showLabels && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help">OpenAI</span>
              </TooltipTrigger>
              <TooltipContent>
                {getTooltipContent('OpenAI', aiStatus.openai.status, aiStatus.openai.message)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {getStatusIcon(aiStatus.perplexity.status)}
        {showLabels && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help">Perplexity</span>
              </TooltipTrigger>
              <TooltipContent>
                {getTooltipContent('Perplexity', aiStatus.perplexity.status, aiStatus.perplexity.message)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {getStatusIcon(aiStatus.anthropic.status)}
        {showLabels && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help">Claude</span>
              </TooltipTrigger>
              <TooltipContent>
                {getTooltipContent('Claude', aiStatus.anthropic.status, aiStatus.anthropic.message)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}