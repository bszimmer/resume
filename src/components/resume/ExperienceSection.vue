<script setup lang="ts">
interface Job {
  company: string
  roles: string[]
  startDate: string
  endDate: string
  bullets: string[]
}

// TODO: Fill in your real job history here
const jobs: Job[] = [
  {
    company: 'Autodesk',
    roles: ['Manager'],
    startDate: 'August 2024',
    endDate: 'Present',
    bullets: [
      'Lead a team of 6 software engineers',
      'Shipped an internal MCP platform in < 2 months to support ChatGPT Enterprise rollout',
      'Mentored 5 engineers and 3 interns across the organization',
    ],
  },
  {
    company: 'Autodesk',
    roles: ['Principal Software Engineer'],
    startDate: 'August 2022',
    endDate: 'September 2024',
    bullets: [
      'Delivered Autodesk’s internal ChatGPT-style AI product using Vue.js, LangChain, AWS Fargate',
      'Architected an automated Azure OpenAI platform for secure, rapid model deployments.',
      'Built ingestion pipelines integrating internal wiki and document sources as company AI tools.',
    ],
  },
  {
    company: 'Autodesk',
    roles: ['Senior Software Engineer', 'Software Engineer'],
    startDate: 'July 2019',
    endDate: 'August 2022',
    bullets: [
      'Developed .NET APIs to manage Entra ID and on-prem groups using Microsoft Graph and LDAP.',
      'Automated the provisioning of an Entra ID tenant, achieving FedRAMP Moderate compliance.',
      'Engineered 3 Vue.js apps to enable self-service for enterprise workflows.',
    ],
  },
  {
    company: 'Dow Chemical',
    roles: ['Software Engineer'],
    startDate: 'June 2017',
    endDate: 'July 2019',
    bullets: [
      'Delivered and modernized multiple .NET web applications supporting Dow R&D.',
      'Built predictive modeling applications with integrated machine-learning models and Aurelia SPAs',
    ],
  },
]
</script>

<template>
  <div class="experience-section">
    <div class="section-header" style="background: #ff6b4a; color: #000">
      <h2>EXPERIENCE</h2>
    </div>
    <div class="section-body">
      <div v-for="job in jobs" :key="job.company + job.startDate" class="job">
        <div class="job-header">
          <div class="job-title-row">
            <span class="role">{{ job.roles.join(' + ') }}</span>
            <span class="dates">{{ job.startDate }} — {{ job.endDate }}</span>
          </div>
          <span class="company">{{ job.company }}</span>
        </div>
        <ul class="bullets">
          <li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.experience-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-header {
  padding: 12px 20px;
}

.section-header h2 {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  margin: 0;
}

.section-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.job {
  border-left: 3px solid #ff6b4a;
  padding-left: 16px;
}

.job-header {
  margin-bottom: 10px;
}

.job-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.role {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #ff6b4a;
}

.dates {
  font-family: system-ui, sans-serif;
  font-size: 11px;
  color: #8892b0;
  white-space: nowrap;
}

.company {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ccd6f6;
}

.bullets {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bullets li {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  color: #a8b2d8;
  line-height: 1.5;
}
</style>
