'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '画像生成に失敗しました');
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err.message || 'エラーが発生しました');
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setImageUrl(null);
    setPrompt('');
    setError(null);
  };

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>🎨 AI画像生成</h1>
        <p className={styles.description}>
          プロンプトを入力して、AIが画像を生成します
        </p>

        <form onSubmit={handleGenerateImage} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="prompt" className={styles.label}>
              プロンプト
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: 青い空に浮かぶ白い雲、油絵のタッチで描いた风景"
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={styles.generateButton}
            >
              {loading ? '生成中...' : '画像を生成'}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={handleClearImage}
                className={styles.clearButton}
              >
                クリア
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className={styles.errorMessage}>
            <strong>エラー:</strong> {error}
          </div>
        )}

        {imageUrl && (
          <div className={styles.resultSection}>
            <h2>生成された画像</h2>
            <div className={styles.imageContainer}>
              <img
                src={imageUrl}
                alt="生成された画像"
                className={styles.image}
              />
            </div>
            <div className={styles.promptDisplay}>
              <strong>プロンプト:</strong> {prompt}
            </div>
          </div>
        )}

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>画像を生成しています...</p>
          </div>
        )}
      </div>
    </main>
  );
}
