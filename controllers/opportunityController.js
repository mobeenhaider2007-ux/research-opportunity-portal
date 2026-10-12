const { pool } = require('../config/db');

/**
 * Helper: Validate Opportunity Payload
 */
function validateOpportunity(data, isUpdate = false) {
  const errors = [];

  const {
    title,
    description,
    research_area,
    faculty_name,
    department,
    required_skills,
    available_positions,
    application_deadline,
    status
  } = data;

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      errors.push('Title is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      errors.push('Description is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || research_area !== undefined) {
    if (!research_area || typeof research_area !== 'string' || research_area.trim() === '') {
      errors.push('Research area is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || faculty_name !== undefined) {
    if (!faculty_name || typeof faculty_name !== 'string' || faculty_name.trim() === '') {
      errors.push('Faculty name is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || department !== undefined) {
    if (!department || typeof department !== 'string' || department.trim() === '') {
      errors.push('Department is required and must be a non-empty string.');
    }
  }

  if (!isUpdate || required_skills !== undefined) {
    if (!required_skills || typeof required_skills !== 'string' || required_skills.trim() === '') {
      errors.push('Required skills are required and must be a non-empty string.');
    }
  }

  if (!isUpdate || available_positions !== undefined) {
    const pos = Number(available_positions);
    if (isNaN(pos) || !Number.isInteger(pos) || pos < 1) {
      errors.push('Available positions must be a positive integer greater than 0.');
    }
  }

  if (!isUpdate || application_deadline !== undefined) {
    if (!application_deadline || isNaN(Date.parse(application_deadline))) {
      errors.push('Application deadline must be a valid date string (YYYY-MM-DD).');
    }
  }

  if (status !== undefined) {
    if (!['Open', 'Closed'].includes(status)) {
      errors.push("Status must be either 'Open' or 'Closed'.");
    }
  }

  return errors;
}

/**
 * GET /api/opportunities
 * Retrieve all opportunities (with optional filtering)
 */
exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;

    let sql = 'SELECT * FROM research_opportunities WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR research_area LIKE ? OR faculty_name LIKE ? OR department LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query(sql, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/opportunities/:id
 * Retrieve a single opportunity by ID
 */
exports.getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunityId = parseInt(id, 10);

    if (isNaN(opportunityId) || opportunityId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid opportunity ID format.' }
      });
    }

    const [rows] = await pool.query(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [opportunityId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Research opportunity not found with ID ${opportunityId}` }
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/opportunities
 * Create a new opportunity
 */
exports.createOpportunity = async (req, res, next) => {
  try {
    const validationErrors = validateOpportunity(req.body, false);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed.',
          details: validationErrors
        }
      });
    }

    const {
      title,
      description,
      research_area,
      faculty_name,
      department,
      required_skills,
      available_positions,
      application_deadline,
      status = 'Open'
    } = req.body;

    // Formatting date to YYYY-MM-DD
    const formattedDeadline = new Date(application_deadline).toISOString().split('T')[0];

    const sql = `
      INSERT INTO research_opportunities 
      (title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      title.trim(),
      description.trim(),
      research_area.trim(),
      faculty_name.trim(),
      department.trim(),
      required_skills.trim(),
      parseInt(available_positions, 10),
      formattedDeadline,
      status
    ]);

    const [newRow] = await pool.query(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Research opportunity created successfully.',
      data: newRow[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/opportunities/:id
 * Update an existing opportunity or toggle status
 */
exports.updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunityId = parseInt(id, 10);

    if (isNaN(opportunityId) || opportunityId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid opportunity ID format.' }
      });
    }

    // Check if record exists
    const [existingRows] = await pool.query(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [opportunityId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Research opportunity not found with ID ${opportunityId}` }
      });
    }

    const currentOpportunity = existingRows[0];

    const validationErrors = validateOpportunity(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed.',
          details: validationErrors
        }
      });
    }

    const {
      title = currentOpportunity.title,
      description = currentOpportunity.description,
      research_area = currentOpportunity.research_area,
      faculty_name = currentOpportunity.faculty_name,
      department = currentOpportunity.department,
      required_skills = currentOpportunity.required_skills,
      available_positions = currentOpportunity.available_positions,
      application_deadline = currentOpportunity.application_deadline,
      status = currentOpportunity.status
    } = req.body;

    const formattedDeadline = new Date(application_deadline).toISOString().split('T')[0];

    const sql = `
      UPDATE research_opportunities 
      SET title = ?, description = ?, research_area = ?, faculty_name = ?, department = ?, 
          required_skills = ?, available_positions = ?, application_deadline = ?, status = ?
      WHERE id = ?
    `;

    await pool.query(sql, [
      typeof title === 'string' ? title.trim() : title,
      typeof description === 'string' ? description.trim() : description,
      typeof research_area === 'string' ? research_area.trim() : research_area,
      typeof faculty_name === 'string' ? faculty_name.trim() : faculty_name,
      typeof department === 'string' ? department.trim() : department,
      typeof required_skills === 'string' ? required_skills.trim() : required_skills,
      parseInt(available_positions, 10),
      formattedDeadline,
      status,
      opportunityId
    ]);

    const [updatedRow] = await pool.query(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [opportunityId]
    );

    res.status(200).json({
      success: true,
      message: 'Research opportunity updated successfully.',
      data: updatedRow[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/opportunities/:id
 * Delete an opportunity by ID
 */
exports.deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opportunityId = parseInt(id, 10);

    if (isNaN(opportunityId) || opportunityId <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid opportunity ID format.' }
      });
    }

    const [existingRows] = await pool.query(
      'SELECT * FROM research_opportunities WHERE id = ?',
      [opportunityId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Research opportunity not found with ID ${opportunityId}` }
      });
    }

    await pool.query('DELETE FROM research_opportunities WHERE id = ?', [opportunityId]);

    res.status(200).json({
      success: true,
      message: 'Research opportunity deleted successfully.',
      id: opportunityId
    });
  } catch (error) {
    next(error);
  }
};
