import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  Image, 
  Platform, 
  StatusBar 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <StatusBar barStyle="light-content" />
      
      {/* ── Fixed Premium Header ── */}
      <View style={[styles.navbar, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <Logo size={36} showText={true} />
        <TouchableOpacity 
          style={[styles.loginBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Feather name="log-in" size={14} color="#0F172A" style={{ marginRight: 6 }} />
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* ── 1. Hero Section ── */}
        <View style={styles.heroSection}>
          <View style={[styles.capsuleLabel, { backgroundColor: theme.primarySurface, borderColor: 'rgba(79, 70, 229, 0.3)' }]}>
            <Feather name="sparkles" size={12} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.capsuleText, { color: theme.primary }]}>THE ULTIMATE AI STUDY COMPANION</Text>
          </View>

          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
            Expand your mind.{'\n'}
            Master your <Text style={{ color: theme.primary }}>universe.</Text>
          </Text>

          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            MindForge harnesses advanced AI to instantly turn your lectures into interactive study guides, dynamic quizzes, and a 24/7 personal tutor. Learning has never been this seamless.
          </Text>

          <TouchableOpacity 
            style={[styles.getStartedBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Feather name="arrow-right" size={16} color="#0F172A" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* ── 2. About & Stats Section ── */}
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border }]}>
          <View style={[styles.capsuleLabel, { backgroundColor: theme.primarySurface, borderColor: 'rgba(79, 70, 229, 0.3)', alignSelf: 'flex-start' }]}>
            <Feather name="info" size={12} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.capsuleText, { color: theme.primary }]}>ABOUT US</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 12 }]}>
            Built for the future of <Text style={{ color: theme.primary }}>learning</Text>
          </Text>

          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            MindForge was founded with a singular mission: to bridge the gap between classroom lectures and deep student understanding using the power of artificial intelligence.
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary, marginBottom: 24 }]}>
            Our platform empowers mentors to upload lecture content and instantly generates a full suite of study tools — transcripts, summaries, flashcards, quizzes, and an AI tutor — all tailored to the exact material taught.
          </Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { number: '10K+', label: 'Active Students' },
              { number: '500+', label: 'Mentors' },
              { number: '98%', label: 'Accuracy' },
              { number: '24/7', label: 'AI Support' }
            ].map((stat, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>{stat.number}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 3. Features Section ── */}
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border }]}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>Everything you need to excel</Text>
            <Text style={[styles.sectionHeaderSubtitle, { color: theme.textSecondary }]}>
              Built for students and mentors who engage with complex coursework and need real-time, AI-driven support.
            </Text>
          </View>

          <View style={styles.featuresList}>
            {[
              { icon: 'mic', title: 'Smart Transcription', desc: 'Real-time AI transcription for every lecture session. Never miss a crucial detail with our highly accurate speech-to-text.' },
              { icon: 'book-open', title: 'AI Study Guides', desc: 'Automatically generated summaries and flashcards. Review core concepts faster with tailored learning materials.' },
              { icon: 'message-square', title: 'Interactive Chat', desc: 'Context-aware chatbot to answer any course query. Get instant, detailed explanations specific to your lecture.' },
              { icon: 'check-square', title: 'Dynamic Quizzes', desc: 'Test your knowledge with auto-generated assessments. Identify weak spots and reinforce understanding on the fly.' },
              { icon: 'grid', title: 'Mentor Dashboard', desc: 'Track progress and manage student interactions. Gain actionable insights into class performance and engagement.' },
              { icon: 'shield', title: 'Secure Storage', desc: 'All your course materials backed up reliably. Access your files anytime with enterprise-grade cloud security.' }
            ].map((feature, idx) => (
              <View key={idx} style={[styles.featureCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={[styles.featureIconWrapper, { backgroundColor: theme.primarySurface }]}>
                  <Feather name={feature.icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 4. How It Works Section ── */}
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border }]}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>How MindForge Works</Text>
            <Text style={[styles.sectionHeaderSubtitle, { color: theme.textSecondary }]}>
              A seamless pipeline turning raw lectures into an interactive, highly optimized learning experience.
            </Text>
          </View>

          <View style={styles.pipeline}>
            {[
              { step: '01', title: 'Upload Media', desc: 'Mentors upload lecture audio or video files to our secure cloud storage.' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI processes the media, generating highly accurate transcripts in real-time.' },
              { step: '03', title: 'Smart Generation', desc: 'Study guides, flashcards, and quizzes are automatically created from the transcript.' },
              { step: '04', title: 'Interactive Learning', desc: 'Students engage with the material and ask questions via our context-aware chatbot.' }
            ].map((step, idx) => (
              <View key={idx} style={styles.pipelineStep}>
                <View style={styles.stepHeaderRow}>
                  <View style={[styles.stepCircle, { borderColor: theme.primary }]}>
                    <Text style={[styles.stepNumber, { color: theme.primary }]}>{step.step}</Text>
                  </View>
                  {idx < 3 && <View style={[styles.stepLine, { backgroundColor: 'rgba(79, 70, 229, 0.3)' }]} />}
                </View>
                <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 5. Testimonials Section ── */}
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: theme.border }]}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>Trusted by Mentors & Students</Text>
            <Text style={[styles.sectionHeaderSubtitle, { color: theme.textSecondary }]}>
              See how MindForge is transforming the educational experience.
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScroll}
            snapToInterval={280 + 16}
            decelerationRate="fast"
          >
            {[
              { name: 'Ashok Maranala', role: 'MindForge Mentor', text: 'MindForge has completely changed how I track my students. The AI summaries save me hours of prep time.' },
              { name: 'Lova Reddy', role: 'Student', text: 'The interactive chatbot is like having a 24/7 tutor. It answers my questions based exactly on what was taught in the lecture.' },
              { name: 'Pavan B', role: 'MindForge Mentor', text: 'The automated transcriptions and dynamic quizzes are incredible. I can instantly see where the class is struggling.' },
              { name: 'Tulasi', role: 'Student', text: 'Having the study guides automatically generated from lectures has saved my grades. The flashcards are a game-changer.' }
            ].map((review, idx) => (
              <View key={idx} style={[styles.reviewCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Feather name="edit-3" size={24} color={theme.primary} style={{ marginBottom: 12 }} />
                <Text style={[styles.reviewText, { color: theme.textSecondary }]}>"{review.text}"</Text>
                <View style={styles.reviewerInfo}>
                  <Image 
                    source={{ uri: `https://ui-avatars.com/api/?name=${review.name.replace(/ /g, '+')}&background=c5a059&color=fff` }} 
                    style={[styles.reviewerAvatar, { borderColor: 'rgba(79, 70, 229, 0.3)' }]} 
                  />
                  <View>
                    <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>{review.name}</Text>
                    <Text style={[styles.reviewerRole, { color: theme.primary }]}>{review.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Footer / Bottom CTA ── */}
        <View style={[styles.footer, { backgroundColor: theme.bgSurface, borderTopWidth: 1, borderTopColor: theme.border }]}>
          <Logo size={42} showText={true} />
          <Text style={[styles.footerTagline, { color: theme.textSecondary }]}>
            Elevate your study experience today. Join standard-setting mentors and students worldwide.
          </Text>
          <TouchableOpacity 
            style={[styles.footerGetStartedBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.footerBtnText}>Join MindForge</Text>
            <Feather name="arrow-right" size={15} color="#0F172A" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          <Text style={[styles.copyright, { color: theme.textMuted }]}>
            © 2026 MindForge. All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navbar: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    zIndex: 10,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: 'center',
    textAlign: 'center',
  },
  capsuleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  capsuleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  getStartedText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    width: (width - 48 - 12) / 2,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  pipeline: {
    gap: 20,
  },
  pipelineStep: {
    alignItems: 'flex-start',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  stepLine: {
    flex: 1,
    height: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  reviewsScroll: {
    gap: 16,
    paddingRight: 24,
    marginTop: 12,
  },
  reviewCard: {
    width: 280,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewerRole: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerTagline: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  footerGetStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  footerBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '500',
  },
});
