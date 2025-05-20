import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importations des traductions
import commonFR from './locales/fr/common.json';
import commonEN from './locales/en/common.json';
import menuFR from './locales/fr/menu.json';
import menuEN from './locales/en/menu.json';
import menuRU from './locales/ru/menu.json';
import menuDE from './locales/de/menu.json';
import addTagModalFR from './locales/fr/addTagModal.json';
import addTagModalEN from './locales/en/addTagModal.json';
import addTagModalRU from './locales/ru/addTagModal.json';
import addTagModalDE from './locales/de/addTagModal.json';
import clientCardFR from './locales/fr/clientCard.json';
import clientCardEN from './locales/en/clientCard.json';
import clientCardRU from './locales/ru/clientCard.json';
import clientCardDE from './locales/de/clientCard.json';
import ordersFilterModalFR from './locales/fr/ordersFilterModal.json';
import ordersFilterModalEN from './locales/en/ordersFilterModal.json';
import ordersFilterModalRU from './locales/ru/ordersFilterModal.json';
import ordersFilterModalDE from './locales/de/ordersFilterModal.json';
import paginationFR from './locales/fr/pagination.json';
import paginationEN from './locales/en/pagination.json';
import paginationRU from './locales/ru/pagination.json';
import paginationDE from './locales/de/pagination.json';
import productCardFR from './locales/fr/productCard.json';
import productCardEN from './locales/en/productCard.json';
import productCardRU from './locales/ru/productCard.json';
import productCardDE from './locales/de/productCard.json';
import productFormFR from './locales/fr/productForm.json';
import productFormEN from './locales/en/productForm.json';
import productFormRU from './locales/ru/productForm.json';
import productFormDE from './locales/de/productForm.json';
import installPromptFR from './locales/fr/installPrompt.json';
import installPromptEN from './locales/en/installPrompt.json';
import installPromptRU from './locales/ru/installPrompt.json';
import installPromptDE from './locales/de/installPrompt.json';
import productsInventoryFR from './locales/fr/productsInventory.json';
import productsInventoryEN from './locales/en/productsInventory.json';
import productsInventoryRU from './locales/ru/productsInventory.json';
import productsInventoryDE from './locales/de/productsInventory.json';
import adminProductsFR from './locales/fr/adminProducts.json';
import adminProductsEN from './locales/en/adminProducts.json';
import adminProductsRU from './locales/ru/adminProducts.json';
import adminProductsDE from './locales/de/adminProducts.json';
import clientOrder_fr from './locales/fr/clientOrder.json';
import clientOrder_en from './locales/en/clientOrder.json';
import clientOrder_ru from './locales/ru/clientOrder.json';
import clientOrder_de from './locales/de/clientOrder.json';
import clientProducts_fr from './locales/fr/clientProducts.json';
import clientProducts_en from './locales/en/clientProducts.json';
import clientProducts_ru from './locales/ru/clientProducts.json';
import clientProducts_de from './locales/de/clientProducts.json';
import createProduct_fr from './locales/fr/createProduct.json';
import createProduct_en from './locales/en/createProduct.json';
import createProduct_ru from './locales/ru/createProduct.json';
import createProduct_de from './locales/de/createProduct.json';
import modifyProduct_fr from './locales/fr/modifyProduct.json';
import modifyProduct_en from './locales/en/modifyProduct.json';
import modifyProduct_ru from './locales/ru/modifyProduct.json';
import modifyProduct_de from './locales/de/modifyProduct.json';
import order_fr from './locales/fr/order.json';
import order_en from './locales/en/order.json';
import order_ru from './locales/ru/order.json';
import order_de from './locales/de/order.json';
import orders_fr from './locales/fr/orders.json';
import orders_en from './locales/en/orders.json';
import orders_ru from './locales/ru/orders.json';
import orders_de from './locales/de/orders.json';
import confirmModalFR from './locales/fr/confirmModal.json';
import confirmModalEN from './locales/en/confirmModal.json';
import confirmModalRU from './locales/ru/confirmModal.json';
import confirmModalDE from './locales/de/confirmModal.json';
import notFoundFR from './locales/fr/notFound.json';
import notFoundEN from './locales/en/notFound.json';
import notFoundRU from './locales/ru/notFound.json';
import notFoundDE from './locales/de/notFound.json';
import settingsFR from './locales/fr/settings.json';
import settingsEN from './locales/en/settings.json';
import settingsRU from './locales/ru/settings.json';
import settingsDE from './locales/de/settings.json';

// Les ressources contiennent les traductions par langue et par namespace
const resources = {
  fr: {
    common: commonFR,
    menu: menuFR,
    addTagModal: addTagModalFR,
    clientCard: clientCardFR,
    ordersFilterModal: ordersFilterModalFR,
    pagination: paginationFR,
    productCard: productCardFR,
    productForm: productFormFR,
    installPrompt: installPromptFR,
    productsInventory: productsInventoryFR,
    adminProducts: adminProductsFR,
    clientOrder: clientOrder_fr,
    clientProducts: clientProducts_fr,
    createProduct: createProduct_fr,
    modifyProduct: modifyProduct_fr,
    order: order_fr,
    orders: orders_fr,
    confirmModal: confirmModalFR,
    notFound: notFoundFR,
    settings: settingsFR,
  },
  en: {
    common: commonEN,
    menu: menuEN,
    addTagModal: addTagModalEN,
    clientCard: clientCardEN,
    ordersFilterModal: ordersFilterModalEN,
    pagination: paginationEN,
    productCard: productCardEN,
    productForm: productFormEN,
    installPrompt: installPromptEN,
    productsInventory: productsInventoryEN,
    adminProducts: adminProductsEN,
    clientOrder: clientOrder_en,
    clientProducts: clientProducts_en,
    createProduct: createProduct_en,
    modifyProduct: modifyProduct_en,
    order: order_en,
    orders: orders_en,
    confirmModal: confirmModalEN,
    notFound: notFoundEN,
    settings: settingsEN,
  },
  ru: {
    menu: menuRU,
    addTagModal: addTagModalRU,
    clientCard: clientCardRU,
    ordersFilterModal: ordersFilterModalRU,
    pagination: paginationRU,
    productCard: productCardRU,
    productForm: productFormRU,
    installPrompt: installPromptRU,
    productsInventory: productsInventoryRU,
    adminProducts: adminProductsRU,
    clientOrder: clientOrder_ru,
    clientProducts: clientProducts_ru,
    createProduct: createProduct_ru,
    modifyProduct: modifyProduct_ru,
    order: order_ru,
    orders: orders_ru,
    confirmModal: confirmModalRU,
    notFound: notFoundRU,
    settings: settingsRU,
  },
  de: {
    menu: menuDE,
    addTagModal: addTagModalDE,
    clientCard: clientCardDE,
    ordersFilterModal: ordersFilterModalDE,
    pagination: paginationDE,
    productCard: productCardDE,
    productForm: productFormDE,
    installPrompt: installPromptDE,
    productsInventory: productsInventoryDE,
    adminProducts: adminProductsDE,
    clientOrder: clientOrder_de,
    clientProducts: clientProducts_de,
    createProduct: createProduct_de,
    modifyProduct: modifyProduct_de,
    order: order_de,
    orders: orders_de,
    confirmModal: confirmModalDE,
    notFound: notFoundDE,
    settings: settingsDE,
  },
};

i18n
  // Chargement des traductions depuis le serveur
  .use(Backend)
  // Détection de la langue du navigateur
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  // Configuration
  .init({
    resources,
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',

    // Namespaces par défaut - ajoutez tous les namespaces que vous utilisez
    ns: [
      'common',
      'menu',
      'addTagModal',
      'clientCard',
      'ordersFilterModal',
      'pagination',
      'productCard',
      'productForm',
      'installPrompt',
      'productsInventory',
      'adminProducts',
      'clientOrder',
      'clientProducts',
      'createProduct',
      'modifyProduct',
      'order',
      'orders',
      'confirmModal',
      'notFound',
      'settings',
    ],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React escape déjà les valeurs
    },

    // Options de détection de langue
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },

    // Load translations on-demand
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
