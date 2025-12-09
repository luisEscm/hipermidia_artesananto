import postService from '../services/postService.js';

class PostController {
  // Criar um novo post
  async createPost(req, res) {
    try {
      const { img, description } = req.body;

      if (!img || !description) {
        return res.status(400).json({
          error: 'Campos img e description são obrigatórios'
        });
      }

      const post = await postService.createPost(img, description);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar todos os posts
  async getAllPosts(req, res) {
    try {
      const posts = await postService.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar um post por ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const post = await postService.getPostById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar um post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { img, description } = req.body;

      if (!img || !description) {
        return res.status(400).json({
          error: 'Campos img e description são obrigatórios'
        });
      }

      const post = await postService.updatePost(id, img, description);

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar um post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const deleted = await postService.deletePost(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PostController();

