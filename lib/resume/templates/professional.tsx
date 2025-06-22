'use client';

import React from 'react';
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  experienceItem: {
    marginBottom: 15,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1f2937',
  },
  company: {
    fontSize: 11,
    fontWeight: 400,
    color: '#2563eb',
    marginBottom: 2,
  },
  dateLocation: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  description: {
    marginTop: 5,
  },
  bulletPoint: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 3,
    paddingLeft: 10,
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
  },
  institution: {
    fontSize: 10,
    color: '#2563eb',
    marginBottom: 2,
  },
  educationDetails: {
    fontSize: 9,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  skillCategory: {
    marginBottom: 10,
    minWidth: '45%',
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 5,
  },
  skillsList: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
  },
  projectDescription: {
    fontSize: 9,
    color: '#374151',
    marginTop: 3,
    lineHeight: 1.4,
  },
  projectTech: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 3,
    // Removed italic style since we don't have an italic font variant registered
    // fontStyle: 'italic',
  },
  certificationItem: {
    marginBottom: 8,
  },
  certificationName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1f2937',
  },
  certificationDetails: {
    fontSize: 9,
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

interface ProfessionalResumeProps {
  data: ResumeData;
}

export function ProfessionalResume({ data }: ProfessionalResumeProps) {
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

  const renderContactInfo = () => {
    const contactItems = [];

    if (data.personalInfo.email) {
      contactItems.push(
        <Link
          key="email"
          src={`mailto:${data.personalInfo.email}`}
          style={styles.link}
        >
          {data.personalInfo.email}
        </Link>,
      );
    }

    if (data.personalInfo.phone) {
      contactItems.push(<Text key="phone">{data.personalInfo.phone}</Text>);
    }

    if (data.personalInfo.location) {
      contactItems.push(
        <Text key="location">{data.personalInfo.location}</Text>,
      );
    }

    if (data.personalInfo.linkedin) {
      contactItems.push(
        <Link
          key="linkedin"
          src={data.personalInfo.linkedin}
          style={styles.link}
        >
          LinkedIn
        </Link>,
      );
    }

    if (data.personalInfo.website) {
      contactItems.push(
        <Link key="website" src={data.personalInfo.website} style={styles.link}>
          Portfolio
        </Link>,
      );
    }

    return contactItems.map((item, index) => (
      <View key={index} style={styles.contactItem}>
        {item}
        {index < contactItems.length - 1 && (
          <Text style={{ marginHorizontal: 5 }}>•</Text>
        )}
      </View>
    ));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.name}</Text>
          <View style={styles.contactInfo}>{renderContactInfo()}</View>
        </View>

        {/* Professional Summary */}
        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                  </View>
                  <View style={styles.dateLocation}>
                    <Text>
                      {formatDate(exp.startDate)} -{' '}
                      {formatDate(exp.endDate || 'Present')}
                    </Text>
                    {exp.location && <Text>{exp.location}</Text>}
                  </View>
                </View>
                <View style={styles.description}>
                  {exp.description.map((desc, descIndex) => (
                    <Text key={descIndex} style={styles.bulletPoint}>
                      {desc}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>{edu.institution}</Text>
                <View style={styles.educationDetails}>
                  {edu.location && <Text>{edu.location}</Text>}
                  {edu.graduationDate && (
                    <Text>Graduated: {formatDate(edu.graduationDate)}</Text>
                  )}
                  {edu.gpa && <Text>GPA: {edu.gpa}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {data.skills.map((skillCategory, index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>
                    {skillCategory.category}
                  </Text>
                  <Text style={styles.skillsList}>
                    {skillCategory.items.join(' • ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Text style={styles.projectName}>
                  {project.url ? (
                    <Link src={project.url} style={styles.link}>
                      {project.name}
                    </Link>
                  ) : (
                    project.name
                  )}
                </Text>
                <Text style={styles.projectDescription}>
                  {project.description}
                </Text>
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Text style={styles.certificationName}>{cert.name}</Text>
                <Text style={styles.certificationDetails}>
                  {cert.issuer}
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
