const db = require("../config/db");

function courtModel () {};

courtModel.getFilteredCourts = ({ filters }, callback) => {
  let sql = `
    SELECT 
      f.field_id,  
      f.field_name, 
      f.price_per_hour, 
      f.sport_type,
      f.open_time, 
      f.close_time, 
      c.coop, 
      STRING_AGG(sl.service_name, ', ') AS services 
    FROM 
      fields f
    JOIN 
      centres c ON f.centre_id = c.centre_id
    JOIN 
      centre_service cs ON c.centre_id = cs.centre_id
    JOIN 
      service_list sl ON cs.service_id = sl.service_id
    WHERE 1=1
  `;

  const params = [];

  // Filter by `field_type`
  if (filters.field_type && filters.field_type.length > 0) {
    sql += ` AND f.field_type IN ('${filters.field_type.join("','")}')`;
  }

  // Filter by `sport_type`
  if (filters.sport_type && filters.sport_type.length > 0) {
    sql += ` AND f.sport_type IN ('${filters.sport_type.join("','")}')`;
  }

  // Filter by `service_name`
  if (filters.service_name && filters.service_name.length > 0) {
    sql += ` AND sl.service_name IN ('${filters.service_name.join("','")}')`;
  }

  sql += ` GROUP BY 
    f.field_id, 
    f.field_name, 
    f.price_per_hour, 
    f.open_time, 
    f.close_time, 
    c.coop`;

  db.query(sql, params, (err, results) => {
    console.log('Query results:', results);
    callback(err, results);
});
};

/*Test model court filters
courtModel.getFilteredCourts({ 
  filters: { 
      field_type: ['Sân 7'], 
      sport_type: ['Bóng đá'], 
  }
}, (err, results) => {
  if (err) {
      console.error('Error fetching courts:', err);
  } else {
      console.log('Results:', results);
  }
});
*/ 

// Lấy chi tiết sân
courtModel.getCourtDetails = (id, callback) => {
  const sql = `
      SELECT 
          f.field_id,
          f.field_name,
          f.price_per_hour,
          f.open_time,
          f.close_time,
          c.coop,
          f.field_type,
          GROUP_CONCAT(DISTINCT sl.service_name) AS services,
          (SELECT COUNT(*) 
           FROM fields 
           WHERE field_type = f.field_type) AS same_type_count
      FROM 
          fields f
      JOIN 
          centres c ON f.centre_id = c.centre_id
      LEFT JOIN 
          centre_service cs ON c.centre_id = cs.centre_id
      LEFT JOIN 
          service_list sl ON cs.service_id = sl.service_id
      WHERE 
          f.field_id = ?
      GROUP BY 
          f.field_id;
  `;
  db.query(sql, id, (err, results) => {
      callback(err, results[0]); // Trả về chi tiết sân
  });
};

// Lấy danh sách feedback
courtModel.getCourtFeedbacks = (id, callback) => {
  const sql = `
      SELECT 
          fb.feedback_id,
          fb.star,
          fb.created_at,
          fb.description,
          c.first_name,
          c.last_name
      FROM 
          feedbacks fb
      JOIN 
          customers c ON fb.cust_id = c.cust_id
      WHERE 
          fb.field_id = ?
      ORDER BY 
          fb.created_at DESC;
  `;
  db.query(sql, id, (err, results) => {
      callback(err, results);
  });
};

module.exports = courtModel

