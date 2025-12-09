import db from '../config/database.js';

class PostService {
  // Criar um novo post
  async createPost(img, description) {
    const sql = 'INSERT INTO posts (img, description) VALUES (?, ?)';

    const result = await new Promise((resolve, reject) => {
      db.run(sql, [img, description], function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    return { id: result.lastID, img, description };
  }

  // Buscar todos os posts
  async getAllPosts() {
    const sql = 'SELECT * FROM posts';
    return await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Buscar um post por ID
  async getPostById(id) {
    const sql = 'SELECT * FROM posts WHERE id = ?';
    return await new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Atualizar um post
  async updatePost(id, img, description) {
    const sql = 'UPDATE posts SET img = ?, description = ? WHERE id = ?';
    const result = await new Promise((resolve, reject) => {
      db.run(sql, [img, description, id], function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    if (result.changes === 0) {
      return null;
    }

    return { id, img, description };
  }

  // Deletar um post
  async deletePost(id) {
    const sql = 'DELETE FROM posts WHERE id = ?';
    const result = await new Promise((resolve, reject) => {
      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    return result.changes > 0;
  }
}

export default new PostService();
