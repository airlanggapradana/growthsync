const https = require('https');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const url = 'https://drive.google.com/drive/folders/1tKx0HA5gGS2J-5J3oY0LGTh5kNMTVUku';
    const html = await getUrl(url);
    console.log("HTML length:", html.length);
    
    // Let's print out script block sizes or search for strings
    const files = [];
    
    // Look for GDrive image matches inside JS variables:
    // e.g. ["1abcde_ID", "name.png", ...]
    const regex = /"([a-zA-Z0-9_-]{33})",\["([^"]+\.(?:png|jpg|jpeg|gif))"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      const name = match[2];
      if (!files.find(f => f.id === id)) {
        files.push({ id, name });
      }
    }

    // Try alternate format for shorter IDs or other patterns:
    const regex2 = /\["([a-zA-Z0-9_-]{33})","([^"]+)"/g;
    while ((match = regex2.exec(html)) !== null) {
      const id = match[1];
      const name = match[2];
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        if (!files.find(f => f.id === id)) {
          files.push({ id, name });
        }
      }
    }

    // Broad search of typical GDrive share IDs and filenames
    const regex3 = /"([a-zA-Z0-9_-]{33})"\s*,\s*\[\s*"([^"]+)"/g;
    while ((match = regex3.exec(html)) !== null) {
      const id = match[1];
      const name = match[2];
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        if (!files.find(f => f.id === id)) {
          files.push({ id, name });
        }
      }
    }

    console.log("Found files count:", files.length);
    console.log(JSON.stringify(files, null, 2));
    
    // Let's do a backup search for ANY .png or .jpg names to see if they are there
    const imageExtensions = /"([^"]+\.(?:png|jpg|jpeg))"/g;
    let imgMatch;
    const names = new Set();
    while ((imgMatch = imageExtensions.exec(html)) !== null) {
      names.add(imgMatch[1]);
    }
    console.log("Unique image names in source:", Array.from(names).slice(0, 50));
    
  } catch (err) {
    console.error(err);
  }
}

run();
