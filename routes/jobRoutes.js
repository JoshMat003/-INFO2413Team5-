router.get('/jobs/search', async (req, res) => {
    try {
        const {
            dueDate,
            jobCategory,
            location,
            minSalary,
            maxSalary
        } = req.query;

        let query = `
            SELECT * FROM job_posts 
            WHERE 1=1
        `;
        const values = [];

        if (dueDate) {
            query += ` AND DATE(application_deadline) = ?`;
            values.push(dueDate);
        }

        if (jobCategory) {
            query += ` AND job_category = ?`;
            values.push(jobCategory);
        }

        if (location) {
            query += ` AND job_location LIKE ?`;
            values.push(`%${location}%`);
        }

        if (minSalary) {
            query += ` AND min_salary >= ?`;
            values.push(minSalary);
        }

        if (maxSalary) {
            query += ` AND max_salary <= ?`;
            values.push(maxSalary);
        }

        query += ` ORDER BY application_deadline ASC`;

        const [results] = await db.query(query, values);
        res.json(results);
    } catch (error) {
        console.error('Error searching jobs:', error);
        res.status(500).json({ error: 'Failed to search jobs' });
    }
});

router.get('/jobs/:id', async (req, res) => {
    try {
        const [job] = await db.query(
            'SELECT * FROM job_posts WHERE job_id = ?',
            [req.params.id]
        );
        
        if (job.length === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json(job[0]);
    } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ error: 'Failed to fetch job details' });
    }
});

router.get('/applicant/available-jobs', async (req, res) => {
    try {
        const {
            dueDate,
            jobCategory,
            location,
            minSalary,
            maxSalary
        } = req.query;

        let query = 
                `SELECT 
                    j.job_id,
                    j.job_title,
                    j.job_category_id,
                    jc.JobCategory_ID,
                    jc.JobCategory_Name,
                    j.job_position,
                    j.annual_salary,
                    j.city,
                    j.province,
                    j.job_post_description,
                    j.application_due_date,
                    j.contact_email,
                    j.minimum_education,
                    j.required_experience
                FROM jobpost_table AS j
                INNER JOIN jobcategory_table AS jc 
                    ON j.job_category_id = jc.JobCategory_ID
                WHERE 1=1`
            ;
        
        const values = [];

        if (dueDate) {
            query += ` AND DATE(j.application_due_date) <= ?`;
            values.push(dueDate);
        }

        if (jobCategory) {
            query += ` AND j.job_category_id = ?`;
            values.push(jobCategory);
        }

        if (location) {
            query += ` AND j.city = ?`;
            values.push(location);
        }

        if (minSalary) {
            query += ` AND j.annual_salary >= ?`;
            values.push(minSalary);
        }

        if (maxSalary) {
            query += ` AND j.annual_salary <= ?`;
            values.push(maxSalary);
        }

        query += ` ORDER BY j.application_due_date DESC`;

        console.log('Executing query:', query);
        const results = await db.query(query, values);
        console.log('First result row:', results[0]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching job posts:', error);
        res.status(500).json({ error: 'Failed to fetch job posts' });
    }
}); 