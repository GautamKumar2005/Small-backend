function validateSubmissionPayload(req, res, next) {
  // 1. Size check (10 KB limit)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 10240) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Submission payload exceeds the maximum allowed size of 10 KB.'
    });
  }

  // 2. Check if body exists and is an object
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Submission body must be a valid JSON object.'
    });
  }

  // 3. Check that body is not completely empty
  const keys = Object.keys(req.body).filter(k => !k.startsWith('_'));
  if (keys.length === 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Submission body cannot be empty.'
    });
  }

  // 4. Basic email format check if "email" field is provided
  if (req.body.email && typeof req.body.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid email address format.'
      });
    }
  }

  next();
}

module.exports = {
  validateSubmissionPayload
};
