const fs = require('fs');
const apps = ['BrowserApp', 'CodeEditorApp', 'MusicPlayerApp', 'FileManagerApp', 'TextEditorApp', 'FileCompressorApp', 'TaskManagerApp', 'TerminalApp'];
apps.forEach(app => {
  const content = `import React from 'react';
import styles from './AppContent.module.css';

const ${app}: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>${app}</h3>
      </div>
      <div className={styles.content}>
        <p>This is the simulation for ${app}.</p>
      </div>
    </div>
  );
};

export default ${app};
`;
  fs.writeFileSync('src/features/mini-os/apps/' + app + '.tsx', content);
});
