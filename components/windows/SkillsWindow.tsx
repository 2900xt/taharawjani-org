'use client'

import React from 'react'

export default function SkillsWindow() {
  const skillCategories = [
    {
      title: "Programming Languages",
      skills: [
        { name: "C/C++", level: 95 },
        { name: "x86 Assembly", level: 85 },
        { name: "Python", level: 90 },
        { name: "Java", level: 85 },
        { name: "JavaScript", level: 80 },
        { name: "Unity C#", level: 75 }
      ]
    },
    {
      title: "Technologies & Frameworks", 
      skills: [
        { name: "Git", level: 95 },
        { name: "PyTorch/TensorFlow", level: 85 },
        { name: "Next.js/React", level: 80 },
        { name: "AWS (Bedrock, S3, Lambda, EC2)", level: 85 },
        { name: "Embedded Systems", level: 80 }
      ]
    },
    {
      title: "Competitive Programming",
      skills: [
        { name: "Codeforces Expert", level: 95 },
        { name: "USACO Gold Division", level: 90 },
        { name: "AtCoder", level: 85 },
        { name: "LeetCode", level: 90 }
      ]
    },
    {
      title: "Specializations",
      skills: [
        { name: "Operating Systems", level: 90 },
        { name: "AI/Machine Learning", level: 85 },
        { name: "Algorithms & Data Structures", level: 95 },
        { name: "System Programming", level: 90 }
      ]
    }
  ]

  return (
    <div className="window">
      <div className="window-title">Skills</div>
      <div className="window-content active">
        <div className="skills-list">
          {skillCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="skill-item">
              <div className="skill-title">{category.title}</div>
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="stats-row">
                  <div className="stats-label">{skill.name}:</div>
                  <div className="skill-bar">
                    <div 
                      className="skill-progress" 
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}