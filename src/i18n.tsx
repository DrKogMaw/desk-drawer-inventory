import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'es';
type Variables = Record<string, string | number>;

const categoryTranslations: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    'Stationery & Paper': 'Papelería y papel',
    'Cables & Tech': 'Cables y tecnología',
    'Hardware & Tools': 'Ferretería y herramientas',
    'Office Supplies': 'Material de oficina',
    'Audio & Media': 'Audio y multimedia',
    'Personal & Keys': 'Objetos personales y llaves',
    'Medical & Care': 'Salud y cuidado',
    Miscellaneous: 'Varios',
  },
};

const translations = {
  en: {
    language: 'Language', english: 'English', spanish: 'Español', inventoryManager: 'Inventory Manager',
    allDrawersRange: 'All Drawers ({{range}})', itemsCount: '{{count}} items', lowOutStock: 'Low / Out of Stock',
    deskCabinet: 'Desk Cabinet', drawer: 'Drawer', stackedDrawers: 'Stacked Drawers', addDrawer: 'Add New Drawer',
    renameDrawer: 'Rename Drawer', deleteDrawer: 'Delete Drawer', lowCount: '{{count}} low', offlineStorage: 'Offline Local Storage',
    drawerNumber: 'Drawer {{id}}', allDrawers: 'All {{count}} Drawers', lowStockFilter: 'Low Stock Warning Filter',
    inventoryOverview: 'Inventory Overview', rename: 'Rename', viewingDrawer: 'Viewing contents of Drawer {{id}}',
    managingAll: 'Managing items stored across all desk drawers', export: 'Export', import: 'Import',
    exportTitle: 'Export inventory to JSON file', importTitle: 'Import inventory from JSON file',
    lightMode: 'Switch to Light Mode', darkMode: 'Switch to Dark Mode', addItem: 'Add Item', uniqueItems: 'Unique Items',
    totalQuantity: 'Total Quantity', units: '{{count}} units', lowStockAlert: 'Low Stock Alert', active: 'Active', filter: 'Filter',
    searchPlaceholder: 'Search items by name, category, or description...', clear: 'Clear', gridCards: 'Grid Cards', tableView: 'Table View',
    editItemTitle: 'Edit Inventory Item', addItemTitle: 'Add New Item', editItemHelp: 'Update details and quantity for this item',
    addItemHelp: 'Add a new item to one of your desk drawers', itemName: 'Item Name', itemNamePlaceholder: 'e.g. USB-C Cable, Gel Pens, Stapler...',
    assignedDrawer: 'Assigned Desk Drawer', categoryIcon: 'Category & Icon', customEmoji: 'Custom Emoji Icon', quantity: 'Quantity (Amount)',
    lowThreshold: 'Low Stock Threshold', descriptionOptional: 'Description (Optional)',
    descriptionPlaceholder: 'Add optional notes, specifications, brand info, or location within drawer...', cancel: 'Cancel',
    saveChanges: 'Save Changes', createItem: 'Create Item', nameRequired: 'Item name is required.', quantityNegative: 'Quantity cannot be negative.',
    addDrawerNumber: 'Add Drawer #{{id}}', editDrawerNumber: 'Edit Drawer #{{id}}', addDrawerHelp: 'Add a new stackable compartment to your desk cabinet',
    editDrawerHelp: 'Update the label and theme for Drawer #{{id}}', drawerName: 'Drawer Name',
    drawerNamePlaceholder: 'e.g. Drawer 6 - Electronics & Sensors', drawerNotes: 'Drawer Description / Notes',
    drawerNotesPlaceholder: 'e.g. Cables, adapters, memory cards...', handleColor: 'Handle Color Accent', noDescription: 'No description provided',
    preview: 'Preview', createDrawer: 'Create Drawer', noItemsSearch: 'No items found matching "{{query}}"',
    allStocked: 'All items are well stocked!', noItemsDrawer: 'No items in this drawer', trySearch: 'Try searching with different keywords or check spelling.',
    greatStock: 'Great job! None of your items are low or out of stock.', getStarted: 'Get started by adding items to this desk drawer.',
    addFirstItem: 'Add First Item', itemNameColumn: 'Item Name', category: 'Category', status: 'Status', actions: 'Actions', general: 'General',
    outOfStock: 'Out of Stock', lowStock: 'Low Stock', inStock: 'In Stock', editItem: 'Edit item', deleteItem: 'Delete item',
    noDescriptionPeriod: 'No description provided.', qty: 'Qty:', decreaseQuantity: 'Decrease quantity by 1', increaseQuantity: 'Increase quantity by 1',
    editItemDetails: 'Edit item details', updatedQuantity: 'Updated "{{name}}" quantity to {{quantity}}', updatedItem: 'Updated item "{{name}}"',
    newItem: 'New Item', addedItem: 'Added new item "{{name}}" to Drawer {{drawer}}', confirmDeleteItem: 'Are you sure you want to delete "{{name}}"?',
    deletedItem: 'Deleted item "{{name}}"', createdDrawer: 'Created Drawer #{{id}} - "{{name}}"', updatedDrawer: 'Updated Drawer #{{id}} - "{{name}}"',
    confirmDeleteDrawer: 'Are you sure you want to delete Drawer #{{id}} ("{{name}}")?',
    drawerItemsWarning: 'Warning: This drawer currently contains {{count}} item(s)! These items will also be removed.', deletedDrawer: 'Deleted Drawer #{{id}}',
    backupSaved: 'Backup saved to: {{path}}', backupExported: 'Inventory backup exported successfully!', backupImported: 'Inventory backup imported successfully!',
    parseFailed: 'Failed to parse imported JSON file', inventoryImported: 'Inventory imported successfully!', invalidFormat: 'Invalid JSON inventory format',
    readError: 'Error reading JSON file', resetConfirm: 'Reset all inventory back to initial default sample data?', resetDone: 'Reset to default inventory data',
  },
  es: {
    language: 'Idioma', english: 'English', spanish: 'Español', inventoryManager: 'Gestor de inventario',
    allDrawersRange: 'Todos los cajones ({{range}})', itemsCount: '{{count}} artículos', lowOutStock: 'Stock bajo / agotado',
    deskCabinet: 'Cajonera', drawer: 'Cajón', stackedDrawers: 'Cajones apilados', addDrawer: 'Añadir cajón',
    renameDrawer: 'Renombrar cajón', deleteDrawer: 'Eliminar cajón', lowCount: '{{count}} bajos', offlineStorage: 'Almacenamiento local sin conexión',
    drawerNumber: 'Cajón {{id}}', allDrawers: 'Los {{count}} cajones', lowStockFilter: 'Filtro de stock bajo',
    inventoryOverview: 'Resumen del inventario', rename: 'Renombrar', viewingDrawer: 'Viendo el contenido del cajón {{id}}',
    managingAll: 'Gestionando artículos de todos los cajones', export: 'Exportar', import: 'Importar',
    exportTitle: 'Exportar inventario a un archivo JSON', importTitle: 'Importar inventario desde un archivo JSON',
    lightMode: 'Cambiar al modo claro', darkMode: 'Cambiar al modo oscuro', addItem: 'Añadir artículo', uniqueItems: 'Artículos únicos',
    totalQuantity: 'Cantidad total', units: '{{count}} unidades', lowStockAlert: 'Alerta de stock bajo', active: 'Activo', filter: 'Filtrar',
    searchPlaceholder: 'Buscar por nombre, categoría o descripción...', clear: 'Limpiar', gridCards: 'Tarjetas', tableView: 'Tabla',
    editItemTitle: 'Editar artículo', addItemTitle: 'Añadir artículo', editItemHelp: 'Actualiza los detalles y la cantidad de este artículo',
    addItemHelp: 'Añade un artículo a uno de tus cajones', itemName: 'Nombre del artículo', itemNamePlaceholder: 'p. ej., cable USB-C, bolígrafos, grapadora...',
    assignedDrawer: 'Cajón asignado', categoryIcon: 'Categoría e icono', customEmoji: 'Icono emoji personalizado', quantity: 'Cantidad',
    lowThreshold: 'Umbral de stock bajo', descriptionOptional: 'Descripción (opcional)',
    descriptionPlaceholder: 'Añade notas, especificaciones, marca o ubicación dentro del cajón...', cancel: 'Cancelar',
    saveChanges: 'Guardar cambios', createItem: 'Crear artículo', nameRequired: 'El nombre del artículo es obligatorio.', quantityNegative: 'La cantidad no puede ser negativa.',
    addDrawerNumber: 'Añadir cajón n.º {{id}}', editDrawerNumber: 'Editar cajón n.º {{id}}', addDrawerHelp: 'Añade un nuevo compartimento apilable a tu cajonera',
    editDrawerHelp: 'Actualiza la etiqueta y el tema del cajón n.º {{id}}', drawerName: 'Nombre del cajón',
    drawerNamePlaceholder: 'p. ej., Cajón 6 - Electrónica y sensores', drawerNotes: 'Descripción / notas del cajón',
    drawerNotesPlaceholder: 'p. ej., cables, adaptadores, tarjetas de memoria...', handleColor: 'Color de la manija', noDescription: 'Sin descripción',
    preview: 'Vista previa', createDrawer: 'Crear cajón', noItemsSearch: 'No se encontraron artículos para "{{query}}"',
    allStocked: '¡Todos los artículos tienen suficiente stock!', noItemsDrawer: 'No hay artículos en este cajón', trySearch: 'Prueba otras palabras o revisa la ortografía.',
    greatStock: '¡Buen trabajo! No hay artículos con stock bajo o agotado.', getStarted: 'Empieza añadiendo artículos a este cajón.',
    addFirstItem: 'Añadir primer artículo', itemNameColumn: 'Nombre', category: 'Categoría', status: 'Estado', actions: 'Acciones', general: 'General',
    outOfStock: 'Agotado', lowStock: 'Stock bajo', inStock: 'En stock', editItem: 'Editar artículo', deleteItem: 'Eliminar artículo',
    noDescriptionPeriod: 'Sin descripción.', qty: 'Cant.:', decreaseQuantity: 'Reducir la cantidad en 1', increaseQuantity: 'Aumentar la cantidad en 1',
    editItemDetails: 'Editar detalles del artículo', updatedQuantity: 'Cantidad de "{{name}}" actualizada a {{quantity}}', updatedItem: 'Artículo "{{name}}" actualizado',
    newItem: 'Nuevo artículo', addedItem: 'Artículo "{{name}}" añadido al cajón {{drawer}}', confirmDeleteItem: '¿Seguro que quieres eliminar "{{name}}"?',
    deletedItem: 'Artículo "{{name}}" eliminado', createdDrawer: 'Cajón n.º {{id}} creado: "{{name}}"', updatedDrawer: 'Cajón n.º {{id}} actualizado: "{{name}}"',
    confirmDeleteDrawer: '¿Seguro que quieres eliminar el cajón n.º {{id}} ("{{name}}")?',
    drawerItemsWarning: 'Aviso: este cajón contiene {{count}} artículo(s). También se eliminarán.', deletedDrawer: 'Cajón n.º {{id}} eliminado',
    backupSaved: 'Copia guardada en: {{path}}', backupExported: '¡Copia del inventario exportada correctamente!', backupImported: '¡Copia del inventario importada correctamente!',
    parseFailed: 'No se pudo procesar el archivo JSON importado', inventoryImported: '¡Inventario importado correctamente!', invalidFormat: 'Formato JSON de inventario no válido',
    readError: 'Error al leer el archivo JSON', resetConfirm: '¿Restablecer todo el inventario a los datos de ejemplo iniciales?', resetDone: 'Inventario restablecido a los datos predeterminados',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, variables?: Variables) => string;
  categoryLabel: (category: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() =>
    localStorage.getItem('desk_drawer_language') === 'es' ? 'es' : 'en'
  );

  useEffect(() => {
    localStorage.setItem('desk_drawer_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key, variables = {}) => {
      let text: string = translations[language][key];
      Object.entries(variables).forEach(([name, value]) => {
        text = text.split(`{{${name}}}`).join(String(value));
      });
      return text;
    },
    categoryLabel: (category) => categoryTranslations[language][category] || category,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
