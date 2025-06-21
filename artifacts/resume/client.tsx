'use client';

import React, { useEffect } from 'react';
import { Artifact } from '@/components/create-artifact';
import { ResumeTemplate } from '@/components/resume-template';
import type { ResumeData } from '@/lib/resume/schema';
import { mergeWithDefaults } from '@/lib/resume/schema';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CopyIcon, PlusIcon } from '@/components/icons';
import { toast } from 'sonner';

interface ResumeArtifactMetadata {
  resumeData: ResumeData | null;
}

export const resumeArtifact = new Artifact<'resume', ResumeArtifactMetadata>({
  kind: 'resume',
  description: 'Generate professional PDF resumes from conversation data.',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      resumeData: null,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible: true,
          status: 'streaming',
        };
      });
    }
  },
  content: ({ title, content, status, isLoading, metadata, setMetadata }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="text" />;
    }

    // Parse the resume data from the content string
    let resumeData: ResumeData;

    try {
      const parsedData = JSON.parse(content || '{}');
      // Ensure we have a valid structure by merging with defaults
      resumeData = mergeWithDefaults(parsedData);
    } catch (error) {
      console.error('Failed to parse resume data:', error);
      // Fallback to default resume structure with error message
      resumeData = mergeWithDefaults({
        personalInfo: {
          name: 'Resume Generation Failed',
          email: '',
        },
        summary:
          'There was an error loading your resume data. Please try regenerating the resume.',
      });
    }

    // Update metadata with parsed data using useEffect
    useEffect(() => {
      if (metadata && !metadata.resumeData && resumeData) {
        setMetadata({ resumeData });
      }
    }, [metadata, resumeData, setMetadata]);

    // Show loading state while the resume is being generated
    if (status === 'streaming') {
      return (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Generating your resume...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Analyzing conversation and extracting information
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full p-4">
        <ResumeTemplate data={resumeData} title={title} isLoading={isLoading} />
      </div>
    );
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy resume data to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Resume data copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PlusIcon />,
      description: 'Regenerate resume',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Please regenerate my resume with any updates from our conversation.',
        });
      },
    },
  ],
});
