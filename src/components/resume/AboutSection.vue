<script setup lang="ts">
interface Link {
  label: string
  url: string
}

const name = 'Brennan Zimmer'
const titles = ['Software Engineer', 'Leader', 'Bookworm']
const bio =
  'I am an engineer with a passion for solving problems. I am currently working at Autodesk as a software engineering manager, leading a team of talented software engineers that bring AI to Autodesk employees.'

const links: Link[] = [
  { label: 'LinkedIn', url: 'https://linkedin.com/in/brennan-zimmer' },
  { label: 'Email', url: 'mailto:brennanszimmer@gmail.com' },
]
</script>

<template>
  <div class="about-section">
    <div class="section-header" style="background: #44ff88; color: #000">
      <h2>ABOUT</h2>
    </div>
    <div class="section-body">
      <div class="identity">
        <img src="/profile.webp" alt="Brennan Zimmer" class="profile-photo" />
        <div class="identity-text">
          <h3 class="name">{{ name }}</h3>
          <div class="title-container">
            <p v-for="title in titles" :key="title" class="title-tag">{{ title }}</p>
          </div>
        </div>
      </div>

      <p class="bio">{{ bio }}</p>

      <div class="links">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-btn"
        >
          {{ link.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-header {
  padding: 12px 20px;
  margin-bottom: 0;
}

.section-header h2 {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  margin: 0;
}

.section-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.identity {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-photo {
  width: 90px;
  height: 90px;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid #44ff88;
  box-shadow: 0 0 12px rgba(68, 255, 136, 0.4);
}

.name {
  font-family: 'Press Start 2P', monospace;
  font-size: 13px;
  color: #fff;
  margin: 0 0 8px 0;
}

.title-tag {
  display: inline-block;
  background: #44ff88;
  color: #000;
  padding: 4px 8px;
  font-size: 11px;
  font-family: system-ui, sans-serif;
  font-weight: 600;
  margin-right: 8px;
  margin-bottom: 8px;
}

.bio {
  font-family: system-ui, sans-serif;
  font-size: 14px;
  color: #ccd6f6;
  line-height: 1.7;
}

.links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.link-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  padding: 8px 14px;
  background: transparent;
  border: 2px solid #44ff88;
  color: #44ff88;
  text-decoration: none;
  transition: background 0.15s;
}

.link-btn:hover {
  background: rgba(68, 255, 136, 0.15);
}
</style>
