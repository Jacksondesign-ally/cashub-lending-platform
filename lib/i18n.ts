export type Locale = 'en' | 'tn' | 'pt' | 'fr' | 'zu' | 'sw' | 'ar'

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: 'en', label: 'English',    flag: '🇬🇧' },
  { id: 'tn', label: 'Tswana',     flag: '🇧🇼' },
  { id: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { id: 'fr', label: 'French',     flag: '🇫🇷' },
  { id: 'zu', label: 'Zulu',       flag: '🇿🇦' },
  { id: 'sw', label: 'Swahili',    flag: '��' },
  { id: 'ar', label: 'Arabic',     flag: '��' },
]

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.loans': 'Loan Officer',
    'nav.borrowers': 'Borrowers',
    'nav.payments': 'Payments',
    'nav.registry': 'Shared Registry',
    'nav.blacklist': 'Blacklist',
    'nav.scam_alerts': 'Scam Alerts',
    'nav.compliance': 'NAMFISA',
    'nav.marketplace': 'Marketplace',
    'nav.reports': 'Reports',
    'nav.billing': 'Billing',
    'nav.settings': 'Settings',
    'nav.onboarding': 'Lender Onboarding',
    'nav.search': 'Advanced Search',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.no_results': 'No results found',
    'common.upgrade': 'Upgrade',
    'common.logout': 'Logout',
    'borrower.invite': 'Invite Borrower',
    'borrower.add': 'Add Borrower',
    'borrower.registry': 'Borrower Registry',
    'borrower.download': 'Download Application',
    'borrower.save_contact': 'Save Contact',
    'loan.apply': 'Apply for Loan',
    'loan.approve': 'Approve',
    'loan.decline': 'Decline',
    'loan.amount': 'Loan Amount',
    'settings.language': 'Language',
    'settings.language_desc': 'Select your preferred language for the platform interface',
  },
  tn: {
    'nav.dashboard': 'Setlhare sa Tsamaiso', 'nav.loans': 'Motlhami wa Kalafi', 'nav.borrowers': 'Bakoloti', 'nav.payments': 'Dituelo',
    'nav.registry': 'Rejisteri e Amanngwang', 'nav.blacklist': 'Lenaane la Bolwetse', 'nav.scam_alerts': 'Ditlhagiso tsa Merero',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'Ntlo ya Kgwebo', 'nav.reports': 'Dipego', 'nav.billing': 'Tefelo',
    'nav.settings': 'Dithulaganyo', 'nav.onboarding': 'Ingodiso ya Moadiedi', 'nav.search': 'Batla go Menagane',
    'common.search': 'Batla', 'common.filter': 'Sireletsa', 'common.save': 'Boloka', 'common.cancel': 'Khansela',
    'common.delete': 'Phimola', 'common.edit': 'Baakanya', 'common.view': 'Bona', 'common.add': 'Tlhompha',
    'common.status': 'Maemo', 'common.actions': 'Dikgato', 'common.loading': 'E a laediwa...', 'common.no_results': 'Ga go na diphetho',
    'common.upgrade': 'Godisa', 'common.logout': 'Tswa', 'borrower.invite': 'Mema Mokoloti', 'borrower.add': 'Tlhompha Mokoloti',
    'borrower.registry': 'Rejisteri ya Bakoloti', 'borrower.download': 'Laela Kopo', 'borrower.save_contact': 'Boloka Mogala',
    'loan.apply': 'Kopa Kalafi', 'loan.approve': 'Dumela', 'loan.decline': 'Gana', 'loan.amount': 'Palo ya Kalafi',
    'settings.language': 'Puo', 'settings.language_desc': 'Tlhopha puo ya gago e e ratang',
  },
  pt: {
    'nav.dashboard': 'Painel', 'nav.loans': 'Oficial de Crédito', 'nav.borrowers': 'Mutuários', 'nav.payments': 'Pagamentos',
    'nav.registry': 'Registo Partilhado', 'nav.blacklist': 'Lista Negra', 'nav.scam_alerts': 'Alertas de Fraude',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'Mercado', 'nav.reports': 'Relatórios', 'nav.billing': 'Faturação',
    'nav.settings': 'Configurações', 'nav.onboarding': 'Registo de Credor', 'nav.search': 'Pesquisa Avançada',
    'common.search': 'Pesquisar', 'common.filter': 'Filtrar', 'common.save': 'Guardar', 'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar', 'common.edit': 'Editar', 'common.view': 'Ver', 'common.add': 'Adicionar',
    'common.status': 'Estado', 'common.actions': 'Ações', 'common.loading': 'A carregar...', 'common.no_results': 'Sem resultados',
    'common.upgrade': 'Melhorar', 'common.logout': 'Sair', 'borrower.invite': 'Convidar Mutuário', 'borrower.add': 'Adicionar Mutuário',
    'borrower.registry': 'Registo de Mutuários', 'borrower.download': 'Descarregar Candidatura', 'borrower.save_contact': 'Guardar Contacto',
    'loan.apply': 'Candidatar-se a Empréstimo', 'loan.approve': 'Aprovar', 'loan.decline': 'Recusar', 'loan.amount': 'Valor do Empréstimo',
    'settings.language': 'Idioma', 'settings.language_desc': 'Seleccione o seu idioma preferido',
  },
  fr: {
    'nav.dashboard': 'Tableau de bord', 'nav.loans': 'Agent de Prêt', 'nav.borrowers': 'Emprunteurs', 'nav.payments': 'Paiements',
    'nav.registry': 'Registre Partagé', 'nav.blacklist': 'Liste Noire', 'nav.scam_alerts': 'Alertes Arnaque',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'Marché', 'nav.reports': 'Rapports', 'nav.billing': 'Facturation',
    'nav.settings': 'Paramètres', 'nav.onboarding': 'Inscription Prêteur', 'nav.search': 'Recherche Avancée',
    'common.search': 'Rechercher', 'common.filter': 'Filtrer', 'common.save': 'Enregistrer', 'common.cancel': 'Annuler',
    'common.delete': 'Supprimer', 'common.edit': 'Modifier', 'common.view': 'Voir', 'common.add': 'Ajouter',
    'common.status': 'Statut', 'common.actions': 'Actions', 'common.loading': 'Chargement...', 'common.no_results': 'Aucun résultat',
    'common.upgrade': 'Améliorer', 'common.logout': 'Déconnexion', 'borrower.invite': 'Inviter Emprunteur', 'borrower.add': 'Ajouter Emprunteur',
    'borrower.registry': 'Registre Emprunteurs', 'borrower.download': 'Télécharger Dossier', 'borrower.save_contact': 'Sauvegarder Contact',
    'loan.apply': 'Demander un Prêt', 'loan.approve': 'Approuver', 'loan.decline': 'Refuser', 'loan.amount': 'Montant du Prêt',
    'settings.language': 'Langue', 'settings.language_desc': 'Sélectionnez votre langue préférée',
  },
  zu: {
    'nav.dashboard': 'Ibhodi Lokuphatha', 'nav.loans': 'Isikhulu Semalimboleko', 'nav.borrowers': 'Abakoleli', 'nav.payments': 'Izinkokhelo',
    'nav.registry': 'Irejistra Elihlanganisiwe', 'nav.blacklist': 'Uhlu Olumnyama', 'nav.scam_alerts': 'Izexwayiso Zenkohliso',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'Indawo Yokuthenga', 'nav.reports': 'Imibiko', 'nav.billing': 'Ikhodi Yokukhokha',
    'nav.settings': 'Izilungiselelo', 'nav.onboarding': 'Ukubhalisa Komubolekisi', 'nav.search': 'Ukusesha Okujulile',
    'common.search': 'Sesha', 'common.filter': 'Hlunga', 'common.save': 'Londoloza', 'common.cancel': 'Khansela',
    'common.delete': 'Susa', 'common.edit': 'Hlela', 'common.view': 'Buka', 'common.add': 'Engeza',
    'common.status': 'Isimo', 'common.actions': 'Izenzo', 'common.loading': 'Iyalayisha...', 'common.no_results': 'Azikho iziphumo',
    'common.upgrade': 'Thuthukisa', 'common.logout': 'Phuma', 'borrower.invite': 'Mema Umukoleli', 'borrower.add': 'Engeza Umukoleli',
    'borrower.registry': 'Irejistra Labakoleli', 'borrower.download': 'Dawuniloda Isicelo', 'borrower.save_contact': 'Londoloza Oxhumana Naye',
    'loan.apply': 'Faka Isicelo Semalimboleko', 'loan.approve': 'Vuma', 'loan.decline': 'Nqaba', 'loan.amount': 'Inani Lemalimboleko',
    'settings.language': 'Ulimi', 'settings.language_desc': 'Khetha ulimi lwakho oluthandayo',
  },
  sw: {
    'nav.dashboard': 'Dashibodi', 'nav.loans': 'Afisa wa Mkopo', 'nav.borrowers': 'Wakopaji', 'nav.payments': 'Malipo',
    'nav.registry': 'Rejista ya Pamoja', 'nav.blacklist': 'Orodha Nyeusi', 'nav.scam_alerts': 'Tahadhari za Ulaghai',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'Soko', 'nav.reports': 'Ripoti', 'nav.billing': 'Ankara',
    'nav.settings': 'Mipangilio', 'nav.onboarding': 'Usajili wa Mkopeshaji', 'nav.search': 'Utafutaji wa Kina',
    'common.search': 'Tafuta', 'common.filter': 'Chuja', 'common.save': 'Hifadhi', 'common.cancel': 'Ghairi',
    'common.delete': 'Futa', 'common.edit': 'Hariri', 'common.view': 'Tazama', 'common.add': 'Ongeza',
    'common.status': 'Hali', 'common.actions': 'Vitendo', 'common.loading': 'Inapakia...', 'common.no_results': 'Hakuna matokeo',
    'common.upgrade': 'Boresha', 'common.logout': 'Toka', 'borrower.invite': 'Alika Mkopaji', 'borrower.add': 'Ongeza Mkopaji',
    'borrower.registry': 'Rejista ya Wakopaji', 'borrower.download': 'Pakua Maombi', 'borrower.save_contact': 'Hifadhi Mawasiliano',
    'loan.apply': 'Omba Mkopo', 'loan.approve': 'Idhinisha', 'loan.decline': 'Kataa', 'loan.amount': 'Kiasi cha Mkopo',
    'settings.language': 'Lugha', 'settings.language_desc': 'Chagua lugha unayopendelea',
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم', 'nav.loans': 'مسؤول القروض', 'nav.borrowers': 'المقترضون', 'nav.payments': 'المدفوعات',
    'nav.registry': 'السجل المشترك', 'nav.blacklist': 'القائمة السوداء', 'nav.scam_alerts': 'تنبيهات الاحتيال',
    'nav.compliance': 'NAMFISA', 'nav.marketplace': 'السوق', 'nav.reports': 'التقارير', 'nav.billing': 'الفواتير',
    'nav.settings': 'الإعدادات', 'nav.onboarding': 'تسجيل المُقرض', 'nav.search': 'البحث المتقدم',
    'common.search': 'بحث', 'common.filter': 'تصفية', 'common.save': 'حفظ', 'common.cancel': 'إلغاء',
    'common.delete': 'حذف', 'common.edit': 'تعديل', 'common.view': 'عرض', 'common.add': 'إضافة',
    'common.status': 'الحالة', 'common.actions': 'الإجراءات', 'common.loading': 'جاري التحميل...', 'common.no_results': 'لا توجد نتائج',
    'common.upgrade': 'ترقية', 'common.logout': 'تسجيل خروج', 'borrower.invite': 'دعوة مقترض', 'borrower.add': 'إضافة مقترض',
    'borrower.registry': 'سجل المقترضين', 'borrower.download': 'تنزيل الطلب', 'borrower.save_contact': 'حفظ جهة الاتصال',
    'loan.apply': 'التقدم للحصول على قرض', 'loan.approve': 'موافقة', 'loan.decline': 'رفض', 'loan.amount': 'مبلغ القرض',
    'settings.language': 'اللغة', 'settings.language_desc': 'اختر لغتك المفضلة للمنصة',
  },
}

export function t(key: string, locale?: Locale): string {
  const lang = locale || (typeof window !== 'undefined' ? localStorage.getItem('locale') as Locale : null) || 'en'
  return translations[lang]?.[key] || translations.en[key] || key
}

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem('locale') as Locale) || 'en'
}

export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}
