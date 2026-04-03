<script setup lang="ts">
interface Degree {
  school: string
  degree: string
  field: string
  year: string
  logo: string
}

interface Activity {
  name: string
  role: string
  years: string
}

const degrees: Degree[] = [
  {
    school: 'University of Michigan, Ann Arbor',
    degree: 'B.S.',
    field: 'Computer Science',
    year: '2017',
    logo: '/michigan.webp',
  },
]

const activities: Activity[] = [
  {
    name: 'Michigan Club Soccer Team',
    role: 'Goalkeeper',
    years: '2013 – 2015',
  },
  {
    name: 'Computer Science Tutor',
    role: 'Tutor',
    years: '2016 - 2017',
  },
  {
    name: 'Dominoes Pizza + South Quad Dining Hall',
    role: 'Employee',
    years: '2015 – 2017',
  },
]
</script>

<template>
  <div class="education-section">
    <div class="section-header" style="background: #cc88ff; color: #000">
      <h2>EDUCATION</h2>
    </div>
    <div class="section-body">
      <div class="subsection">
        <h3 class="subsection-title">DEGREES</h3>
        <div v-for="degree in degrees" :key="degree.school + degree.year" class="degree">
          <img :src="degree.logo" :alt="degree.school" class="school-logo" />
          <div class="degree-info">
            <div class="degree-name">{{ degree.degree }} {{ degree.field }}</div>
            <div class="degree-school">{{ degree.school }}</div>
            <div class="degree-year">{{ degree.year }}</div>
          </div>
        </div>
      </div>

      <div class="subsection">
        <h3 class="subsection-title">ACTIVITIES</h3>
        <div v-for="activity in activities" :key="activity.name" class="activity">
          <div class="activity-name">{{ activity.name }}</div>
          <div class="activity-meta">{{ activity.role }} · {{ activity.years }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.education-section {
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
  gap: 28px;
}

.subsection-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #cc88ff;
  margin-bottom: 16px;
  letter-spacing: 0.05em;
}

.degree {
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 3px solid #cc88ff;
  padding-left: 16px;
}

.school-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  flex-shrink: 0;
  border: 2px solid #cc88ff;
  box-shadow: 0 0 10px rgba(204, 136, 255, 0.4);
  background: #fff;
  padding: 4px;
}

.degree-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.degree-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: #fff;
}

.degree-school {
  font-family: system-ui, sans-serif;
  font-size: 14px;
  color: #ccd6f6;
}

.degree-year {
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #8892b0;
}

.activity {
  padding: 10px 14px;
  border: 1px solid rgba(204, 136, 255, 0.3);
  margin-bottom: 10px;
}

.activity-name {
  font-family: system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ccd6f6;
  margin-bottom: 4px;
}

.activity-meta {
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #8892b0;
}
</style>
