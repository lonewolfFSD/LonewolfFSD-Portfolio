import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      "About Me": "About Me",
      "LonewolfFSD Blogs": "LonewolfFSD Blogs",
      "The RepoHub": "The RepoHub",
      "FSD DevSync": "FSD DevSync",
      "Wanna Collaborate?": "Wanna Collaborate?",
      "Hello! I'm LonewolfFSD": "Hello! I'm LonewolfFSD",
      "Building digital experiences with focus on": "Building digital experiences with focus on",
      "innovation": "innovation",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "A full-stack developer crafting innovative solutions through clean code and intuitive design",
      "View Projects": "View Projects",
      "Let's Connect": "Let's Connect",
    },
  },
  es: {
    translation: {
      "About Me": "Sobre Mí",
      "LonewolfFSD Blogs": "Blogs de LonewolfFSD",
      "The RepoHub": "El RepoHub",
      "FSD DevSync": "FSD DevSync",
      "Wanna Collaborate?": "¿Quieres Colaborar?",
      "Hello! I'm LonewolfFSD": "¡Hola! Soy LonewolfFSD",
      "Building digital experiences with focus on": "Creando experiencias digitales con enfoque en",
      "innovation": "innovación",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "Un desarrollador full-stack que crea soluciones innovadoras con código limpio y diseño intuitivo",
      "View Projects": "Ver Proyectos",
      "Let's Connect": "Conéctate",
    },
  },
  fr: {
    translation: {
      "About Me": "À Propos",
      "LonewolfFSD Blogs": "Blogs LonewolfFSD",
      "The RepoHub": "Le RepoHub",
      "FSD DevSync": "FSD DevSync",
      "Wanna Collaborate?": "Voulez-vous collaborer ?",
      "Hello! I'm LonewolfFSD": "Bonjour ! Je suis LonewolfFSD",
      "Building digital experiences with focus on": "Création d’expériences numériques axées sur",
      "innovation": "innovation",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "Développeur full-stack créant des solutions innovantes avec un code propre et un design intuitif",
      "View Projects": "Voir les projets",
      "Let's Connect": "Connectons-nous",
    },
  },
  it: {
    translation: {
      "About Me": "Su di Me",
      "LonewolfFSD Blogs": "Blog di LonewolfFSD",
      "The RepoHub": "L'RepoHub",
      "FSD DevSync": "FSD DevSync",
      "Wanna Collaborate?": "Vuoi Collaborare?",
      "Hello! I'm LonewolfFSD": "Ciao! Sono LonewolfFSD",
      "Building digital experiences with focus on": "Costruendo esperienze digitali con un focus su",
      "innovation": "innovazione",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "Sviluppatore full-stack che crea soluzioni innovative con codice pulito e design intuitivo",
      "View Projects": "Visualizza Progetti",
      "Let's Connect": "Connettiamoci",
    },
  },
  pt: {
    translation: {
      "About Me": "Sobre Mim",
      "LonewolfFSD Blogs": "Blogs LonewolfFSD",
      "The RepoHub": "O RepoHub",
      "FSD DevSync": "FSD DevSync",
      "Wanna Collaborate?": "Quer Colaborar?",
      "Hello! I'm LonewolfFSD": "Olá! Eu sou LonewolfFSD",
      "Building digital experiences with focus on": "Criando experiências digitais com foco em",
      "innovation": "inovação",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "Desenvolvedor full-stack criando soluções inovadoras com código limpio e design intuitivo",
      "View Projects": "Ver Projetos",
      "Let's Connect": "Vamos Conectar",
    },
  },
  ja: {
    translation: {
      "About Me": "私について",
      "LonewolfFSD Blogs": "LonewolfFSDブログ",
      "The RepoHub": "リポハブ",
      "FSD DevSync": "FSDデブシンク",
      "Wanna Collaborate?": "コラボしたい？",
      "Hello! I'm LonewolfFSD": "こんにちは！私はLonewolfFSDです",
      "Building digital experiences with focus on": "～に焦点を当てたデジタル体験を構築",
      "innovation": "革新",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "クリーンなコードと直感的なデザインで革新的なソリューションを生み出すフルスタック開発者",
      "View Projects": "プロジェクトを見る",
      "Let's Connect": "つながりましょう",
    },
  },
  zh: {
    translation: {
      "About Me": "关于我",
      "LonewolfFSD Blogs": "LonewolfFSD博客",
      "The RepoHub": "代码中心",
      "FSD DevSync": "FSD开发同步",
      "Wanna Collaborate?": "想合作吗？",
      "Hello! I'm LonewolfFSD": "你好！我是LonewolfFSD",
      "Building digital experiences with focus on": "构建专注于...的数字体验",
      "innovation": "创新",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "一位全栈开发者，通过整洁代码和直观设计打造创新解决方案",
      "View Projects": "查看项目",
      "Let's Connect": "让我们联系",
    },
  },
  ko: {
    translation: {
      "About Me": "나에 대해",
      "LonewolfFSD Blogs": "LonewolfFSD 블로그",
      "The RepoHub": "리포허브",
      "FSD DevSync": "FSD 개발 동기화",
      "Wanna Collaborate?": "협력하고 싶나요?",
      "Hello! I'm LonewolfFSD": "안녕하세요! 저는 LonewolfFSD입니다",
      "Building digital experiences with focus on": "에 집중한 디지털 경험을 구축",
      "innovation": "혁신",
      "A full-stack developer crafting innovative solutions through clean code and intuitive design": "깔끔한 코드와 직관적인 디자인으로 혁신적인 솔루션을 만드는 풀스택 개발자",
      "View Projects": "프로젝트 보기",
      "Let's Connect": "연결합시다",
    },
  },
};

i18n
  .use(LanguageDetector) // Detects browser language
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React escapes by default
    },
  });

export default i18n;