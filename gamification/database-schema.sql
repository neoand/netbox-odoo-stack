-- 🎮 Gamification Database Schema
-- NetBox Learning Platform

-- ==================================================
-- USERS & PROFILES
-- ==================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    country VARCHAR(2), -- ISO 3166-1 alpha-2
    language VARCHAR(5) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    level INTEGER DEFAULT 1,
    current_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    global_rank INTEGER,
    monthly_rank INTEGER,
    country_rank INTEGER,
    team_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- POINTS & TRANSACTIONS
-- ==================================================

CREATE TABLE point_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    points INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_id UUID, -- Reference to specific activity
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_levels (
    level_number INTEGER PRIMARY KEY,
    required_points INTEGER NOT NULL,
    level_name VARCHAR(50) NOT NULL,
    badge_icon VARCHAR(50)
);

-- Insert default levels
INSERT INTO user_levels (level_number, required_points, level_name, badge_icon) VALUES
(1, 0, 'Beginner', '🌱'),
(2, 500, 'Learner', '📚'),
(3, 1000, 'Student', '🎓'),
(4, 2500, 'Practitioner', '💼'),
(5, 5000, 'Specialist', '⭐'),
(6, 7500, 'Expert', '🏆'),
(7, 10000, 'Advanced', '🚀'),
(8, 15000, 'Professional', '👨‍💻'),
(9, 20000, 'Master', '💎'),
(10, 30000, 'Guru', '🧙‍♂️'),
(11, 40000, 'Legend', '🌟'),
(12, 50000, 'Champion', '👑');

-- ==================================================
-- BADGES & ACHIEVEMENTS
-- ==================================================

CREATE TABLE badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    badge_type VARCHAR(20), -- progress, achievement, seasonal, rare
    rarity VARCHAR(20), -- common, uncommon, rare, epic, legendary
    points_reward INTEGER DEFAULT 0,
    requirements JSONB, -- Dynamic requirements
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    user_id UUID REFERENCES users(user_id),
    badge_id UUID REFERENCES badges(badge_id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_awarded INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, badge_id)
);

-- Insert default badges
INSERT INTO badges (badge_key, name, description, badge_type, rarity, points_reward) VALUES
('bronze_explorer', 'Bronze Explorer', 'Complete 5 tutorials', 'progress', 'common', 100),
('silver_practitioner', 'Silver Practitioner', 'Complete 15 tutorials', 'progress', 'uncommon', 250),
('gold_expert', 'Gold Expert', 'Complete 30 tutorials', 'progress', 'rare', 500),
('diamond_master', 'Diamond Master', 'Complete all tutorials', 'progress', 'legendary', 2000),

('sharpshooter', 'Sharpshooter', '5 quizzes with 100% score', 'achievement', 'rare', 300),
('early_adopter', 'Early Adopter', 'First 100 users', 'achievement', 'rare', 500),
('streak_legend', 'Streak Legend', '100-day learning streak', 'achievement', 'epic', 1000),
('team_player', 'Team Player', 'Help 25+ students', 'achievement', 'uncommon', 200),
('champion', 'Champion', 'Monthly winner 3x', 'achievement', 'legendary', 1500),

('spring_2024', 'Spring 2024', 'Spring challenge completion', 'seasonal', 'rare', 300),
('summer_2024', 'Summer 2024', 'Summer intensive completion', 'seasonal', 'rare', 300),
('fall_2024', 'Fall 2024', 'Autumn projects completion', 'seasonal', 'rare', 300),
('winter_2024', 'Winter 2024', 'Winter labs completion', 'seasonal', 'rare', 300);

-- ==================================================
-- CHALLENGES
-- ==================================================

CREATE TABLE challenges (
    challenge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(20), -- daily, weekly, monthly, special
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    requirements JSONB NOT NULL,
    reward_points INTEGER DEFAULT 0,
    max_participants INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_challenges (
    user_id UUID REFERENCES users(user_id),
    challenge_id UUID REFERENCES challenges(challenge_id),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, failed
    progress JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    PRIMARY KEY (user_id, challenge_id)
);

-- Insert default challenges
INSERT INTO challenges (challenge_key, name, description, challenge_type, requirements, reward_points) VALUES
('daily_tutorial', 'Daily Tutorial', 'Complete 1 tutorial today', 'daily',
 '{"activity": "tutorial_complete", "count": 1}', 100),
('daily_quiz', 'Daily Quiz', 'Pass 1 quiz today', 'daily',
 '{"activity": "quiz_pass", "count": 1, "min_score": 80}', 50),
('daily_help', 'Daily Helper', 'Help 1 student today', 'daily',
 '{"activity": "help_student", "count": 1}', 40),

('weekly_tutorials', 'Weekly Learning Sprint', 'Complete 3 tutorials this week', 'weekly',
 '{"activity": "tutorial_complete", "count": 3}', 500),
('weekly_lab', 'Weekly Lab', 'Complete 1 lab this week', 'weekly',
 '{"activity": "lab_complete", "count": 1}', 750),
('weekly_points', 'Weekly Point Hunter', 'Earn 2000 points this week', 'weekly',
 '{"activity": "points_earn", "total": 2000}', 1000),

('monthly_cert', 'Monthly Certification', 'Complete a certification this month', 'monthly',
 '{"activity": "cert_complete", "count": 1}', 2000),
('monthly_wins', 'Monthly Champion', 'Win 4 weekly challenges', 'monthly',
 '{"activity": "weekly_challenge_win", "count": 4}', 5000),
('monthly_streak', 'Monthly Consistency', 'Maintain 30-day streak', 'monthly',
 '{"activity": "daily_login", "consecutive_days": 30}', 10000);

-- ==================================================
-- LEADERBOARDS
-- ==================================================

CREATE TABLE leaderboards (
    leaderboard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_type VARCHAR(30) NOT NULL, -- global, monthly, country, team
    period_start DATE,
    period_end DATE,
    country VARCHAR(2), -- For country leaderboards
    team_id UUID, -- For team leaderboards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(leaderboard_id),
    user_id UUID REFERENCES users(user_id),
    rank_position INTEGER NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- TEAMS
-- ==================================================

CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    team_key VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    country VARCHAR(2),
    avatar_url VARCHAR(255),
    captain_id UUID REFERENCES users(user_id),
    total_points INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE team_members (
    team_id UUID REFERENCES teams(team_id),
    user_id UUID REFERENCES users(user_id),
    role VARCHAR(20) DEFAULT 'member', -- captain, moderator, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (team_id, user_id)
);

-- ==================================================
-- ACTIVITIES & TRACKING
-- ==================================================

CREATE TABLE user_activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    activity_type VARCHAR(50) NOT NULL,
    activity_reference UUID, -- References tutorial_id, quiz_id, etc.
    metadata JSONB DEFAULT '{}',
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- ==================================================
-- STREAKS & DAILY TRACKING
-- ==================================================

CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(user_id),
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_reset_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_checkins (
    user_id UUID REFERENCES users(user_id),
    checkin_date DATE NOT NULL,
    points_earned INTEGER DEFAULT 10,
    PRIMARY KEY (user_id, checkin_date)
);

-- ==================================================
-- REWARDS & REDEMPTION
-- ==================================================

CREATE TABLE rewards (
    reward_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    reward_type VARCHAR(20), -- digital, physical, discount, certificate
    points_cost INTEGER NOT NULL,
    quantity_available INTEGER, -- NULL for unlimited
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_rewards (
    redemption_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    reward_id UUID REFERENCES rewards(reward_id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, redeemed, shipped, delivered
    redemption_code VARCHAR(50),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Insert default rewards
INSERT INTO rewards (reward_key, name, description, reward_type, points_cost, quantity_available) VALUES
('course_discount', 'Course Discount 25%', '25% off next course purchase', 'discount', 5000, NULL),
('bronze_cert', 'Free Bronze Certification', 'Free Bronze certification exam', 'certificate', 15000, NULL),
('silver_cert', 'Free Silver Certification', 'Free Silver certification exam', 'certificate', 30000, NULL),
('tshirt', 'Official NetBox T-Shirt', 'Branded t-shirt with NetBox logo', 'physical', 25000, 100),
('hoodie', 'Official NetBox Hoodie', 'Cozy hoodie for cold days', 'physical', 40000, 50),
('coffee_mug', 'NetBox Coffee Mug', 'Start your day with NetBox', 'physical', 10000, 200),
('book', 'NetBox Physical Book', 'Comprehensive NetBox guide book', 'physical', 20000, 30),
('headphones', 'Quality Headphones', 'Perfect for focused learning', 'physical', 50000, 20),
('laptop_stand', 'Ergonomic Laptop Stand', 'Improve your posture', 'physical', 35000, 25),
('trophy', 'Custom Trophy', 'Your achievement trophy', 'physical', 100000, 5);

-- ==================================================
-- NOTIFICATIONS
-- ==================================================

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_points ON user_profiles(current_points);
CREATE INDEX idx_user_profiles_rank ON user_profiles(global_rank);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);
CREATE INDEX idx_point_transactions_type ON point_transactions(activity_type);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

CREATE INDEX idx_challenges_type ON challenges(challenge_type);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);

CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank_position);

CREATE INDEX idx_teams_country ON teams(country);
CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- ==================================================
-- TRIGGERS & FUNCTIONS
-- ==================================================

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
BEGIN
    SELECT level_number INTO new_level
    FROM user_levels
    WHERE required_points <= NEW.current_points
    ORDER BY required_points DESC
    LIMIT 1;

    UPDATE user_profiles
    SET level = new_level,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
    AFTER UPDATE OF current_points ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Function to award badge when requirements met
CREATE OR REPLACE FUNCTION check_badge_requirements()
RETURNS TRIGGER AS $$
DECLARE
    badge_record RECORD;
    user_badge_exists BOOLEAN;
BEGIN
    -- Check all badges for this user
    FOR badge_record IN
        SELECT * FROM badges
        WHERE is_active = TRUE
    LOOP
        -- Check if user already has this badge
        SELECT EXISTS(
            SELECT 1 FROM user_badges
            WHERE user_id = NEW.user_id
            AND badge_id = badge_record.badge_id
        ) INTO user_badge_exists;

        IF NOT user_badge_exists THEN
            -- Check requirements (simplified - would need complex logic in real implementation)
            -- This is a placeholder for the actual requirement checking logic
            NULL;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update streaks
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    streak_record RECORD;
    new_streak INTEGER;
BEGIN
    -- Get current streak
    SELECT * INTO streak_record
    FROM user_streaks
    WHERE user_id = NEW.user_id;

    IF streak_record.last_activity_date IS NULL THEN
        -- First activity
        new_streak := 1;
    ELSIF streak_record.last_activity_date = today_date - INTERVAL '1 day' THEN
        -- Continue streak
        new_streak := streak_record.current_streak + 1;
    ELSIF streak_record.last_activity_date = today_date THEN
        -- Already checked in today
        RETURN NEW;
    ELSE
        -- Streak broken
        streak_record.streak_reset_count := streak_record.streak_reset_count + 1;
        new_streak := 1;
    END IF;

    -- Update streak
    INSERT INTO user_streaks (user_id, current_streak, best_streak, last_activity_date)
    VALUES (
        NEW.user_id,
        new_streak,
        CASE WHEN new_streak > streak_record.best_streak THEN new_streak ELSE streak_record.best_streak END,
        today_date
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        current_streak = new_streak,
        best_streak = CASE WHEN new_streak > streak_record.best_streak THEN new_streak ELSE streak_record.best_streak END,
        last_activity_date = today_date,
        streak_reset_count = streak_record.streak_reset_count,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak
    AFTER INSERT ON user_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- ==================================================
-- VIEWS FOR REPORTING
-- ==================================================

-- User leaderboard view
CREATE VIEW v_user_leaderboard AS
SELECT
    u.username,
    u.country,
    up.level,
    up.current_points,
    up.lifetime_points,
    up.streak_days,
    up.global_rank,
    up.monthly_rank,
    t.team_name,
    COUNT(ub.badge_id) as badges_earned
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN teams t ON up.team_id = t.team_id
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
WHERE u.is_active = TRUE
GROUP BY u.username, u.country, up.level, up.current_points, up.lifetime_points,
         up.streak_days, up.global_rank, up.monthly_rank, t.team_name
ORDER BY up.current_points DESC;

-- Team leaderboard view
CREATE VIEW v_team_leaderboard AS
SELECT
    t.team_name,
    t.country,
    t.total_points,
    t.member_count,
    AVG(up.current_points) as avg_points,
    COUNT(ub.badge_id) as total_badges
FROM teams t
JOIN user_profiles up ON t.team_id = up.team_id
JOIN users u ON up.user_id = u.user_id
LEFT JOIN user_badges ub ON u.user_id = ub.user_id
WHERE t.is_active = TRUE AND u.is_active = TRUE
GROUP BY t.team_id, t.team_name, t.country, t.total_points, t.member_count
ORDER BY t.total_points DESC;

-- ==================================================
-- SAMPLE DATA
-- ==================================================

-- Sample users
INSERT INTO users (username, email, password_hash, first_name, last_name, country, language) VALUES
('admin', 'admin@netbox.com', '$2b$12$...', 'Admin', 'User', 'BR', 'pt-BR'),
('jose_silva', 'jose@email.com', '$2b$12$...', 'José', 'Silva', 'BR', 'pt-BR'),
('maria_garcia', 'maria@email.com', '$2b$12$...', 'María', 'García', 'MX', 'es-ES'),
('carlos_mtz', 'carlos@email.com', '$2b$12$...', 'Carlos', 'Martínez', 'MX', 'es-ES');

-- Sample teams
INSERT INTO teams (team_name, team_key, description, country, captain_id) VALUES
('NetBox Brasil', 'BR-TEAM-001', 'Brazilian NetBox learners', 'BR',
 (SELECT user_id FROM users WHERE username='jose_silva')),
('NetBox México', 'MX-TEAM-001', 'Mexican NetBox learners', 'MX',
 (SELECT user_id FROM users WHERE username='maria_garcia'));

-- ==================================================
-- END OF SCHEMA
-- ==================================================
