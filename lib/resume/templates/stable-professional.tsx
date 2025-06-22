'use client';

import React, { useMemo } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import type { ResumeData } from '../schema';
import { registerFonts } from '../fonts';

// Register fonts at module load time
registerFonts();

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    textAlign: 'justify',
  },
  item: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#2563eb',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 9,
    color: '#6b7280',
  },
  description: {
    fontSize: 9,
    color: '#374151',
    marginTop: 3,
    lineHeight: 1.4,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

interface StableProfessionalResumeProps {
  data: ResumeData;
}

export function StableProfessionalResume({ data }: StableProfessionalResumeProps) {
  const formatDate = (date: string) => {
    if (date === 'Present') return 'Present';
    if (!date) return '';

    try {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  // Pre-process all data to avoid dynamic rendering issues
  const processedData = useMemo(() => ({
    name: data?.personalInfo?.name || '',
    email: data?.personalInfo?.email || '',
    phone: data?.personalInfo?.phone || '',
    location: data?.personalInfo?.location || '',
    linkedin: data?.personalInfo?.linkedin || '',
    website: data?.personalInfo?.website || '',
    summary: data?.summary || '',
    experience: (data?.experience || []).slice(0, 10), // Limit to prevent issues
    education: (data?.education || []).slice(0, 5),
    skills: (data?.skills || []).slice(0, 8),
    projects: (data?.projects || []).slice(0, 5),
    certifications: (data?.certifications || []).slice(0, 8),
  }), [data]);

  // Defensive checks for data integrity
  if (!data || !data.personalInfo) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Resume data not available</Text>
        </Page>
      </Document>
    );
  }

  const contactItems = [];
  if (processedData.email) {
    contactItems.push(`Email: ${processedData.email}`);
  }
  if (processedData.phone) {
    contactItems.push(`Phone: ${processedData.phone}`);
  }
  if (processedData.location) {
    contactItems.push(`Location: ${processedData.location}`);
  }
  if (processedData.linkedin) {
    contactItems.push('LinkedIn: Available');
  }
  if (processedData.website) {
    contactItems.push('Portfolio: Available');
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{processedData.name}</Text>
          <View style={styles.contactInfo}>
            <Text>{contactItems.join(' • ')}</Text>
          </View>
        </View>

        {/* Professional Summary */}
        {processedData.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{processedData.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {processedData.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {processedData.experience.map((exp, index) => (
              <View key={`exp-${index}`} style={styles.item}>
                <Text style={styles.itemTitle}>{exp.title || ''}</Text>
                <Text style={styles.itemSubtitle}>{exp.company || ''}</Text>
                <Text style={styles.itemDetails}>
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate || 'Present')}
                  {exp.location && ` • ${exp.location}`}
                </Text>
                {exp.description && exp.description.length > 0 && (
                  <Text style={styles.description}>
                    {exp.description.join(' • ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {processedData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {processedData.education.map((edu, index) => (
              <View key={`edu-${index}`} style={styles.item}>
                <Text style={styles.itemTitle}>{edu.degree || ''}</Text>
                <Text style={styles.itemSubtitle}>{edu.institution || ''}</Text>
                <Text style={styles.itemDetails}>
                  {edu.location && `${edu.location} • `}
                  {edu.graduationDate && `Graduated: ${formatDate(edu.graduationDate)}`}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {processedData.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {processedData.skills.map((skillCategory, index) => (
              <View key={`skill-${index}`} style={styles.item}>
                <Text style={styles.itemTitle}>{skillCategory.category || ''}</Text>
                <Text style={styles.description}>
                  {(skillCategory.items || []).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {processedData.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {processedData.projects.map((project, index) => (
              <View key={`proj-${index}`} style={styles.item}>
                <Text style={styles.itemTitle}>{project.name || ''}</Text>
                <Text style={styles.description}>{project.description || ''}</Text>
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.itemDetails}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {processedData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {processedData.certifications.map((cert, index) => (
              <View key={`cert-${index}`} style={styles.item}>
                <Text style={styles.itemTitle}>{cert.name || ''}</Text>
                <Text style={styles.itemDetails}>
                  {cert.issuer || ''}
                  {cert.date && ` • ${formatDate(cert.date)}`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}