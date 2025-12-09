import db from '../config/database.js';

class PostService {
  
  // Criar um novo post
  createPost(img, description) {
    const sql = `
      INSERT INTO posts (img, description)
      VALUES (?, ?)
    `;

    const result = db.prepare(sql).run(img, description);

    return {
      id: result.lastInsertRowid,
      img,
      description
    };
  }

  // Buscar todos os posts
  getAllPosts() {
    const sql = `SELECT * FROM posts`;
    return db.prepare(sql).all();
  }

  // Buscar um post por ID
  getPostById(id) {
    const sql = `SELECT * FROM posts WHERE id = ?`;
    return db.prepare(sql).get(id);
  }

  // Atualizar um post
  updatePost(id, img, description) {
    const sql = `
      UPDATE posts
      SET img = ?, description = ?
      WHERE id = ?
    `;

    const result = db.prepare(sql).run(img, description, id);

    if (result.changes === 0) {
      return null;
    }

    return { id, img, description };
  }

  // Deletar um post
  deletePost(id) {
    const sql = `DELETE FROM posts WHERE id = ?`;
    const result = db.prepare(sql).run(id);

    return result.changes > 0;
  }
}

export default new PostService();
