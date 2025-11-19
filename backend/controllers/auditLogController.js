// ============================================
// PJICO - Audit Log Controller
// Xem lịch sử thay đổi dữ liệu
// ============================================

const { getConnection, sql } = require('../config/database');

class AuditLogController {
  /**
   * Lấy danh sách audit logs (có phân trang và filter)
   */
  async getAll(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        tableName, 
        recordId, 
        action,
        fromDate,
        toDate,
        changedBy 
      } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const request = pool.request();

      let query = `
        SELECT 
          ID,
          TableName,
          RecordID,
          Action,
          FieldName,
          OldValue,
          NewValue,
          ChangedBy,
          ChangedAt,
          IPAddress,
          UserAgent,
          ChangeReason
        FROM AuditLog
        WHERE 1=1
      `;

      // Filters
      if (tableName) {
        query += ' AND TableName = @tableName';
        request.input('tableName', sql.NVarChar(50), tableName);
      }

      if (recordId) {
        query += ' AND RecordID = @recordId';
        request.input('recordId', sql.NVarChar(50), recordId);
      }

      if (action) {
        query += ' AND Action = @action';
        request.input('action', sql.NVarChar(20), action);
      }

      if (fromDate) {
        query += ' AND ChangedAt >= @fromDate';
        request.input('fromDate', sql.DateTime, fromDate);
      }

      if (toDate) {
        query += ' AND ChangedAt <= @toDate';
        request.input('toDate', sql.DateTime, toDate);
      }

      if (changedBy) {
        query += ' AND ChangedBy LIKE @changedBy';
        request.input('changedBy', sql.NVarChar(100), `%${changedBy}%`);
      }

      query += ` 
        ORDER BY ChangedAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      // Count total
      let countQuery = 'SELECT COUNT(*) as total FROM AuditLog WHERE 1=1';
      if (tableName) {countQuery += ' AND TableName = @tableName';}
      if (recordId) {countQuery += ' AND RecordID = @recordId';}
      if (action) {countQuery += ' AND Action = @action';}
      if (fromDate) {countQuery += ' AND ChangedAt >= @fromDate';}
      if (toDate) {countQuery += ' AND ChangedAt <= @toDate';}
      if (changedBy) {countQuery += ' AND ChangedBy LIKE @changedBy';}

      const countRequest = pool.request();
      if (tableName) {countRequest.input('tableName', sql.NVarChar(50), tableName);}
      if (recordId) {countRequest.input('recordId', sql.NVarChar(50), recordId);}
      if (action) {countRequest.input('action', sql.NVarChar(20), action);}
      if (fromDate) {countRequest.input('fromDate', sql.DateTime, fromDate);}
      if (toDate) {countRequest.input('toDate', sql.DateTime, toDate);}
      if (changedBy) {countRequest.input('changedBy', sql.NVarChar(100), `%${changedBy}%`);}
      const countResult = await countRequest.query(countQuery);

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy logs theo bảng
   */
  async getByTable(req, res, next) {
    try {
      const { table } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      const result = await pool.request()
        .input('tableName', sql.NVarChar(50), table)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT 
            ID,
            TableName,
            RecordID,
            Action,
            FieldName,
            OldValue,
            NewValue,
            ChangedBy,
            ChangedAt,
            IPAddress,
            ChangeReason
          FROM AuditLog
          WHERE TableName = @tableName
          ORDER BY ChangedAt DESC
          OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

      const countResult = await pool.request()
        .input('tableName', sql.NVarChar(50), table)
        .query('SELECT COUNT(*) as total FROM AuditLog WHERE TableName = @tableName');

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy lịch sử của 1 record cụ thể
   */
  async getByRecord(req, res, next) {
    try {
      const { table, id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('tableName', sql.NVarChar(50), table)
        .input('recordId', sql.NVarChar(50), id)
        .query(`
          SELECT 
            ID,
            TableName,
            RecordID,
            Action,
            FieldName,
            OldValue,
            NewValue,
            ChangedBy,
            ChangedAt,
            IPAddress,
            ChangeReason
          FROM AuditLog
          WHERE TableName = @tableName AND RecordID = @recordId
          ORDER BY ChangedAt DESC
        `);

      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Thống kê audit logs
   */
  async getStats(req, res, next) {
    try {
      const { fromDate, toDate } = req.query;

      const pool = await getConnection();
      const request = pool.request();

      let whereClause = '1=1';
      if (fromDate) {
        whereClause += ' AND ChangedAt >= @fromDate';
        request.input('fromDate', sql.DateTime, fromDate);
      }
      if (toDate) {
        whereClause += ' AND ChangedAt <= @toDate';
        request.input('toDate', sql.DateTime, toDate);
      }

      // Thống kê theo bảng
      const byTableResult = await request.query(`
        SELECT 
          TableName,
          COUNT(*) as TotalChanges,
          COUNT(DISTINCT RecordID) as AffectedRecords,
          MIN(ChangedAt) as FirstChange,
          MAX(ChangedAt) as LastChange
        FROM AuditLog
        WHERE ${whereClause}
        GROUP BY TableName
        ORDER BY TotalChanges DESC
      `);

      // Thống kê theo action
      const byActionResult = await pool.request().query(`
        SELECT 
          Action,
          COUNT(*) as Count
        FROM AuditLog
        WHERE ${whereClause}
        GROUP BY Action
      `);

      // Thống kê theo user
      const byUserResult = await pool.request().query(`
        SELECT 
          ChangedBy,
          COUNT(*) as Changes,
          MAX(ChangedAt) as LastActivity
        FROM AuditLog
        WHERE ${whereClause}
        GROUP BY ChangedBy
        ORDER BY Changes DESC
      `);

      // Top thay đổi gần đây
      const recentChanges = await pool.request().query(`
        SELECT TOP 10
          TableName,
          RecordID,
          Action,
          FieldName,
          ChangedBy,
          ChangedAt
        FROM AuditLog
        WHERE ${whereClause}
        ORDER BY ChangedAt DESC
      `);

      res.json({
        success: true,
        data: {
          byTable: byTableResult.recordset,
          byAction: byActionResult.recordset,
          byUser: byUserResult.recordset,
          recentChanges: recentChanges.recordset
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách bảng có audit log
   */
  async getTables(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT DISTINCT 
            TableName,
            COUNT(*) as TotalLogs
          FROM AuditLog
          GROUP BY TableName
          ORDER BY TableName
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * So sánh 2 phiên bản (before/after của 1 record)
   */
  async compareVersions(req, res, next) {
    try {
      const { table, id, version1, version2 } = req.query;

      if (!table || !id || !version1 || !version2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ: table, id, version1, version2 (audit log IDs)'
        });
      }

      const pool = await getConnection();
      
      // Lấy 2 versions
      const result = await pool.request()
        .input('tableName', sql.NVarChar(50), table)
        .input('recordId', sql.NVarChar(50), id)
        .input('v1', sql.BigInt, parseInt(version1))
        .input('v2', sql.BigInt, parseInt(version2))
        .query(`
          SELECT 
            ID,
            FieldName,
            OldValue,
            NewValue,
            ChangedAt,
            ChangedBy
          FROM AuditLog
          WHERE TableName = @tableName 
            AND RecordID = @recordId
            AND ID IN (@v1, @v2)
          ORDER BY ChangedAt
        `);

      if (result.recordset.length < 2) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đủ versions để so sánh'
        });
      }

      res.json({
        success: true,
        data: {
          version1: result.recordset[0],
          version2: result.recordset[1],
          differences: this._compareFields(result.recordset[0], result.recordset[1])
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: So sánh fields giữa 2 versions
   */
  _compareFields(v1, v2) {
    const differences = [];
    
    if (v1.FieldName === v2.FieldName) {
      differences.push({
        fieldName: v1.FieldName,
        oldValue: v1.OldValue,
        intermediateValue: v1.NewValue,
        newValue: v2.NewValue,
        changed: v1.NewValue !== v2.NewValue
      });
    }

    return differences;
  }

  /**
   * Xuất audit log ra CSV
   */
  async exportToCsv(req, res, next) {
    try {
      const { tableName, fromDate, toDate } = req.query;

      const pool = await getConnection();
      const request = pool.request();

      let query = 'SELECT * FROM AuditLog WHERE 1=1';
      if (tableName) {
        query += ' AND TableName = @tableName';
        request.input('tableName', sql.NVarChar(50), tableName);
      }
      if (fromDate) {
        query += ' AND ChangedAt >= @fromDate';
        request.input('fromDate', sql.DateTime, fromDate);
      }
      if (toDate) {
        query += ' AND ChangedAt <= @toDate';
        request.input('toDate', sql.DateTime, toDate);
      }
      query += ' ORDER BY ChangedAt DESC';

      const result = await request.query(query);

      // Convert to CSV
      const csv = this._convertToCSV(result.recordset);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit_log_${Date.now()}.csv`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Convert recordset to CSV
   */
  _convertToCSV(data) {
    if (data.length === 0) {return '';}

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

module.exports = new AuditLogController();
