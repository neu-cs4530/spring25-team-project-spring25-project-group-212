import { useCallback, useEffect, useState } from 'react';
import { Editor, getSnapshot, loadSnapshot } from 'tldraw';

const useBulletinBoardPage = () => {
  const [showCheckMark, setShowCheckMark] = useState(false);

  const handleBulletinBoardSave = useCallback((editor: Editor) => {
    const { document } = getSnapshot(editor.store);
    localStorage.setItem('snapshot', JSON.stringify({ document }));
  }, []);

  const handleBulletinBoardLoad = useCallback((editor: Editor) => {
    const snapshot = localStorage.getItem('snapshot');
    if (!snapshot) return;
    loadSnapshot(editor.store, JSON.parse(snapshot));
  }, []);

  useEffect(() => {
    if (showCheckMark) {
      const timeout = setTimeout(() => {
        setShowCheckMark(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }

    return () => {};
  }, [showCheckMark]);

  return { handleBulletinBoardLoad, handleBulletinBoardSave, showCheckMark, setShowCheckMark };
};

export default useBulletinBoardPage;
