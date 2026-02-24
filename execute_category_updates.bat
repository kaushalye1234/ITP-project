@echo off
REM Batch script to execute SQL commands for category management
REM This demonstrates the process of viewing and adding categories

echo ========================================
echo JOB CATEGORIES MANAGEMENT DEMONSTRATION
echo ========================================
echo.

echo Step 1: Viewing current categories...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "SELECT category_id, category_name, category_icon, is_active FROM job_categories ORDER BY category_name;"
echo.

echo Step 2: Viewing category usage in jobs...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "SELECT jc.category_name, COUNT(j.job_id) as total_jobs, COUNT(CASE WHEN j.job_status = 'active' THEN 1 END) as active_jobs FROM job_categories jc LEFT JOIN jobs j ON jc.category_id = j.category_id GROUP BY jc.category_id, jc.category_name ORDER BY total_jobs DESC;"
echo.

echo Step 3: Adding new categories with icons...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "INSERT INTO job_categories (category_name, description, category_icon, is_active) VALUES ('Roofing', 'Roof repair, installation, and waterproofing services', '🏠', TRUE), ('HVAC', 'Heating, ventilation, and air conditioning services', '❄️', TRUE), ('Flooring', 'Floor installation, repair, and polishing services', '🔲', TRUE), ('Pest Control', 'Professional pest control and fumigation services', '🐛', TRUE), ('Handyman', 'General repair and maintenance services', '🔧', TRUE), ('Moving & Hauling', 'Moving, packing, and transportation services', '📦', TRUE), ('Security Systems', 'Security camera installation and alarm systems', '📹', TRUE), ('Tiling & Masonry', 'Floor and wall tiling, masonry work', '🧱', TRUE), ('Welding & Metal Work', 'Metal fabrication and welding services', '⚒️', TRUE), ('Solar Installation', 'Solar panel installation and maintenance', '☀️', TRUE) ON DUPLICATE KEY UPDATE description = VALUES(description), category_icon = VALUES(category_icon);"
echo.

echo Step 4: Adding icons to existing categories...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "UPDATE job_categories SET category_icon = '⚡' WHERE category_name = 'Electrical'; UPDATE job_categories SET category_icon = '🔧' WHERE category_name = 'Plumbing'; UPDATE job_categories SET category_icon = '🪚' WHERE category_name = 'Carpentry'; UPDATE job_categories SET category_icon = '🎨' WHERE category_name = 'Painting'; UPDATE job_categories SET category_icon = '🔌' WHERE category_name = 'Appliance Repair'; UPDATE job_categories SET category_icon = '🛠️' WHERE category_name = 'General Maintenance'; UPDATE job_categories SET category_icon = '🌳' WHERE category_name = 'Landscaping'; UPDATE job_categories SET category_icon = '🧹' WHERE category_name = 'Cleaning';"
echo.

echo Step 5: Viewing updated categories list...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "SELECT category_id, category_name, category_icon, is_active, created_at FROM job_categories ORDER BY category_name;"
echo.

echo Step 6: Getting category count...
echo.
mysql -u root -p2002Chamindu -D skilled_worker_booking -e "SELECT COUNT(*) as total_categories FROM job_categories WHERE is_active = TRUE;"
echo.

echo ========================================
echo PROCESS COMPLETED!
echo ========================================
echo.
echo Next: Check the frontend at http://localhost:5173
echo The categories should now appear in the dropdown!
echo.
pause

