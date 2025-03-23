const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const logger = require('../utils/logger');

// Schéma de validation pour l'enregistrement
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3),
  role: z.enum(['admin', 'user']).default('user')
});

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Schéma de validation pour le rafraîchissement du token
const refreshSchema = z.object({
  refreshToken: z.string()
});

/**
 * Génération des tokens JWT (accès et rafraîchissement)
 */
const generateTokens = (user) => {
  // Token d'accès - courte durée
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  // Token de rafraîchissement - longue durée
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Contrôleur pour l'enregistrement d'un nouvel utilisateur
 */
const register = async (req, res) => {
  try {
    // Validation des données
    const validatedData = registerSchema.parse(req.body);
    
    const { email, password, name, role } = validatedData;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }
    
    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Création de l'utilisateur
    const user = await req.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });
    
    // Génération des tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Réponse
    res.status(201).json({
      status: 'success',
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de l'enregistrement: ${error.message}`);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

/**
 * Contrôleur pour la connexion d'un utilisateur
 */
const login = async (req, res) => {
  try {
    // Validation des données
    const validatedData = loginSchema.parse(req.body);
    
    const { email, password } = validatedData;
    
    // Vérifier si l'utilisateur existe
    const user = await req.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Génération des tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Réponse
    res.status(200).json({
      status: 'success',
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la connexion: ${error.message}`);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la connexion'
    });
  }
};

/**
 * Contrôleur pour rafraîchir le token JWT
 */
const refreshToken = async (req, res) => {
  try {
    // Validation des données
    const validatedData = refreshSchema.parse(req.body);
    
    const { refreshToken: token } = validatedData;
    
    // Vérifier et décoder le token de rafraîchissement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si l'utilisateur existe
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Génération de nouveaux tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Réponse
    res.status(200).json({
      status: 'success',
      message: 'Token rafraîchi avec succès',
      data: {
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors du rafraîchissement du token: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token de rafraîchissement expiré'
      });
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    res.status(401).json({
      status: 'error',
      message: 'Token de rafraîchissement invalide'
    });
  }
};

/**
 * Contrôleur pour récupérer le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
  try {
    // Récupérer l'utilisateur
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du profil: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

/**
 * Contrôleur pour la déconnexion (côté client)
 */
const logout = (req, res) => {
  // La déconnexion est principalement gérée côté client en supprimant les tokens
  res.status(200).json({
    status: 'success',
    message: 'Déconnexion réussie'
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  logout
};