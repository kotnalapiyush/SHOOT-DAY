import fs from 'fs';

const folders = [
  { name: "Photo shoot data", url: "https://drive.google.com/drive/folders/1L7ZLsPFcXyHZHtorFzuVczDHjoripWHD" },
  { name: "jpeg", url: "https://drive.google.com/drive/folders/1uPEneODkYaRA8tl02OB9ES3KtZFFgE1V" },
  { name: "OG shoot 1", url: "https://drive.google.com/drive/folders/1A5qxC2DNS3tz4Y001YbS9GZuMi58kuLH" },
  { name: "Og 2", url: "https://drive.google.com/drive/folders/1TEuR6OOzSTrYdZoNAI7-vC6VkpYMcx8r" },
  { name: "Krea 3rd Sept", url: "https://drive.google.com/drive/folders/1je_f2fmmq_2uUiaK5LqTZofaEgZlIxNW" }
];

async function main() {
  const allItems = [];

  for (const f of folders) {
    console.log(`Fetching folder: ${f.name}...`);
    try {
      const res = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const html = await res.text();
      fs.writeFileSync(`drive_${f.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`, html);

      // Search for aria-label with filename and ssk containing file ID
      const regex = /aria-label="([^"]+?)\s+(Image|Video|Folder|File|Shared)[^"]*"[^>]*ssk='5:auSv138:([a-zA-Z0-9_-]{28,35})-0-16'/g;
      let m;
      let count = 0;
      while ((m = regex.exec(html)) !== null) {
        allItems.push({
          folder: f.name,
          name: m[1].trim(),
          type: m[2],
          id: m[3]
        });
        count++;
      }

      // Also search second pattern: \\x22(ID)\\x22,\\x5b\\x22(FOLDER)\\x22\\x5d,\\x22(NAME)\\x22
      const regex2 = /\\x22([a-zA-Z0-9_-]{28,35})\\x22,\\x5b\\x22[a-zA-Z0-9_-]+\\x22\\x5d,\\x22([^"\\]+)\\x22/g;
      let m2;
      while ((m2 = regex2.exec(html)) !== null) {
        const id = m2[1];
        const name = m2[2];
        if (!allItems.some(item => item.id === id)) {
          allItems.push({
            folder: f.name,
            name: name,
            type: name.match(/\.(mp4|mov)/i) ? 'Video' : 'Image',
            id: id
          });
          count++;
        }
      }

      console.log(`Found ${count} files in ${f.name}`);
    } catch (err) {
      console.error(`Error in ${f.name}:`, err);
    }
  }

  console.log(`Total collected items: ${allItems.length}`);
  fs.writeFileSync('extracted_drive_files.json', JSON.stringify(allItems, null, 2));
}

main();
