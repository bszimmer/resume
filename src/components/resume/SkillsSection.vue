<script setup lang="ts">
// TODO: Replace placeholder data with your real skills
interface SkillCategory {
  label: string
  color: string
  skills: string[]
}

// TODO: Fill in your real skills here
const categories: SkillCategory[] = [
  {
    label: 'Frontend',
    color: '#4a9eff',
    skills: ['Vue 3', 'TypeScript', 'HTML/CSS', 'Vite', 'd3.js'],
  },
  {
    label: 'Backend',
    color: '#ff6b4a',
    skills: ['C#', 'Python', 'PowerShell', 'REST APIs', 'OAuth/OIDC', '.NET'],
  },
  {
    label: 'Tools & DevOps',
    color: '#44ff88',
    skills: ['Git', 'Docker', 'Azure + AWS', 'CI/CD', 'AWS CDK'],
  },
  {
    label: 'Other',
    color: '#ffdd44',
    skills: ['Agile/Scrum', 'Strategic Planning', 'Mentoring', 'System Design'],
  },
]
</script>

<template>
  <div class="skills-section">
    <div class="section-header" style="background: #ffdd44; color: #000">
      <h2>SKILLS</h2>
    </div>
    <div class="section-body">
      <div v-for="cat in categories" :key="cat.label" class="category">
        <h3 class="category-label" :style="{ color: cat.color }">{{ cat.label }}</h3>
        <div class="tags">
          <span
            v-for="skill in cat.skills"
            :key="skill"
            class="tag"
            :style="{
              borderColor: cat.color,
              color: cat.color,
            }"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skills-section {
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
  gap: 22px;
}

.category-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-family: system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.04);
  letter-spacing: 0.02em;
}
</style>
