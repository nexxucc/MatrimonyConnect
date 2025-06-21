import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    return (
        <div className="flex justify-end p-2">
            <button
                className={`px-3 py-1 rounded-l ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => i18n.changeLanguage('en')}
            >
                English
            </button>
            <button
                className={`px-3 py-1 rounded-r ${i18n.language === 'hi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => i18n.changeLanguage('hi')}
            >
                हिंदी
            </button>
        </div>
    );
};

export default LanguageSwitcher; 