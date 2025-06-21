import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            'Find Your Perfect Match': 'Find Your Perfect Match',
            'Register': 'Register',
            'Login': 'Login',
            'Dashboard': 'Dashboard',
            'Profile': 'Profile',
            'Search': 'Search',
            'Interests': 'Interests',
            'Chat': 'Chat',
            'Subscription': 'Subscription',
            'Admin': 'Admin',
            'Logout': 'Logout',
            // ...add more as needed
        }
    },
    hi: {
        translation: {
            'Find Your Perfect Match': 'अपना आदर्श साथी खोजें',
            'Register': 'रजिस्टर करें',
            'Login': 'लॉगिन',
            'Dashboard': 'डैशबोर्ड',
            'Profile': 'प्रोफ़ाइल',
            'Search': 'खोजें',
            'Interests': 'रुचियां',
            'Chat': 'चैट',
            'Subscription': 'सदस्यता',
            'Admin': 'प्रशासन',
            'Logout': 'लॉगआउट',
            // ...add more as needed
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n; 