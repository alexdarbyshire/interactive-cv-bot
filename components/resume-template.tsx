'use client';

import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, EyeOff } from 'lucide-react';
import { StableProfessionalResume } from '@/lib/resume/templates/stable-professional';
import type { ResumeData } from '@/lib/resume/schema';

interface ResumeTemplateProps {
  data: ResumeData;
  title?: string;
  isLoading?: boolean;
}

export function ResumeTemplate({
  data,
  title = 'Resume',
  isLoading = false,
}: ResumeTemplateProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const doc = <StableProfessionalResume data={data} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(data.personalInfo?.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2"
            size="sm"
          >
            <Download className="size-4" />
            {isDownloading ? 'Preparing...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Resume Preview - Temporarily disabled due to react-pdf reconciler issues */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <p className="mb-4">PDF preview is temporarily disabled due to a technical issue.</p>
              <p>You can still download the PDF using the button above.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resume Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Name</p>
              <p>{data.personalInfo?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p>{data.personalInfo?.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Experience</p>
              <p>
                {data.experience.length} position
                {data.experience.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Education</p>
              <p>
                {data.education.length} degree
                {data.education.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {data.summary && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">
                Professional Summary
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {data.summary}
              </p>
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skillCategory) => (
                  <span
                    key={skillCategory.category}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                  >
                    {skillCategory.category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.projects && data.projects.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">Projects</p>
              <p className="text-sm text-muted-foreground">
                {data.projects.length} project
                {data.projects.length !== 1 ? 's' : ''} included
              </p>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">
                Certifications
              </p>
              <p className="text-sm text-muted-foreground">
                {data.certifications.length} certification
                {data.certifications.length !== 1 ? 's' : ''} included
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Error boundary component for PDF rendering issues
export function ResumeTemplateErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="w-full p-8 text-center">
        {fallback || (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Resume Preview Unavailable
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an issue rendering the resume preview. You can still
              download the PDF.
            </p>
            <Button onClick={() => setHasError(false)}>Try Again</Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
