# DeskDrawer Inventory Manager

DeskDrawer keeps an inventory of items in your desk drawers. Open an item with **Edit** to add several attachments, preview attached photos, download attached documents, or remove files.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.tif`, `.tiff`, `.avif`, `.heic`, `.heif`, `.doc`, `.docx`, and `.pdf`. Other files are rejected even if selected through the system picker. Attachments are stored locally in the app's browser storage, separate from item details, and remain available after restart. Deleted item attachments are removed from storage.

**Export** creates a JSON backup containing both the inventory and all attachment files. **Import** restores those files. Older inventory-only JSON backups still import. Keep the backup file private if its attachments contain personal information.

For development, install dependencies and run `npm run dev`. Run `npm test` and `npm run build` to check changes locally. The Windows installer can be built with `npm run electron:build`.
