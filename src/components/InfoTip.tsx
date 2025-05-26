import React from 'react';
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TipData } from '@/lib/tips';

export interface InfoTipProps {
    tipData?: TipData;
    usePopover?: boolean;
}

export const InfoTip: React.FC<InfoTipProps> = ({ tipData, usePopover = false }) => {
    if (!tipData || (!tipData.title && !tipData.explanation)) return null;

    const triggerButton = (
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 align-middle p-0">
            <Info className="h-4 w-4" />
            <span className="sr-only">More info</span>
        </Button>
    );

    const preferPopover = usePopover || (tipData.explanation && tipData.explanation.length > 100) || tipData.detailsLink;

    if (preferPopover) {
        return (
            <Popover>
                <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        {tipData.title && (
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">{tipData.title}</h4>
                            </div>
                        )}
                        {tipData.explanation && (
                            <div className="grid gap-2">
                                <div className="text-sm text-muted-foreground">
                                    {tipData.explanation}
                                </div>
                            </div>
                        )}
                        {tipData.detailsLink && (
                            <div className="mt-2">
                                <a 
                                    href={tipData.detailsLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Learn more
                                </a>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
    
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    {tipData.title && <p className="font-semibold mb-1">{tipData.title}</p>}
                    <p>{tipData.explanation || tipData.title}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}; 