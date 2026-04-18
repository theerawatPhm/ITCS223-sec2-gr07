DROP DATABASE IF EXISTS sec2_gr7_database;
CREATE DATABASE sec2_gr7_database;
USE sec2_gr7_database;

-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

-- Table: Admin_Info
CREATE TABLE Admin_Info (
    emp_id    VARCHAR(20)  NOT NULL,
    fname     VARCHAR(100) NOT NULL,
    lname     VARCHAR(100) NOT NULL,
    address   VARCHAR(300) NOT NULL,
    birthdate DATE         NOT NULL,
    email     VARCHAR(30)  NOT NULL,
    phone     VARCHAR(15)  NOT NULL,
    CONSTRAINT PK_info PRIMARY KEY (emp_id)
);

-- Table: Admin_Login
CREATE TABLE Admin_Login (
    log_id         VARCHAR(20) NOT NULL,
    username       VARCHAR(30) NOT NULL,
    login_password VARCHAR(30) NOT NULL,
    CONSTRAINT PK_login PRIMARY KEY (log_id),
    CONSTRAINT FK_login FOREIGN KEY (log_id) REFERENCES Admin_Info (emp_id)
);

-- Table: Login_log
CREATE TABLE Login_log (
    log_entry_id INT          NOT NULL AUTO_INCREMENT,
    log_id       VARCHAR(20) NOT NULL,
    login_time   DATETIME    NOT NULL,
    logout_time  DATETIME    NOT NULL,
    login_status VARCHAR(20) NOT NULL,
    CONSTRAINT PK_log  PRIMARY KEY (log_entry_id),
    CONSTRAINT FK_log  FOREIGN KEY (log_id) REFERENCES Admin_Info (emp_id),
    CONSTRAINT CHK_stt CHECK (login_status IN ('succeed', 'failed', 'terminated'))
);

-- Table: Product
CREATE TABLE Product (
    prod_id     VARCHAR(20)    NOT NULL,
    prod_name   VARCHAR(100)   NOT NULL,
    brand       VARCHAR(50)    NOT NULL,
    category    VARCHAR(50)    NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    details     VARCHAR(500)   NOT NULL,
    how_to      VARCHAR(500)   NOT NULL,
    ingredients VARCHAR(500)   NOT NULL,
    rating      INT,
    spe_flag    VARCHAR(50),
    CONSTRAINT PK_prod    PRIMARY KEY (prod_id),
    CONSTRAINT CHK_price  CHECK (price > 0.00),
    CONSTRAINT CHK_rating CHECK (rating BETWEEN 0 AND 5),
    CONSTRAINT CHK_flag   CHECK (spe_flag IN ('Cruelty-free', 'Dermatologically-tested'))
);

-- Table: Product_Variant
CREATE TABLE Product_Variant (
    prod_id  VARCHAR(20) NOT NULL,
    volume   INT         NOT NULL,
    color    VARCHAR(20),
    quantity INT         NOT NULL,
    CONSTRAINT PK_var  PRIMARY KEY (prod_id),
    CONSTRAINT FK_var  FOREIGN KEY (prod_id) REFERENCES Product (prod_id),
    CONSTRAINT CHK_vol CHECK (volume > 0)
);

-- Table: Product_Image
CREATE TABLE Product_Image (
    prod_id   VARCHAR(20) NOT NULL,
    image_id  VARCHAR(20) NOT NULL,
    image_url TEXT        NOT NULL,
    CONSTRAINT PK_img PRIMARY KEY (image_id),
    CONSTRAINT FK_img FOREIGN KEY (prod_id) REFERENCES Product (prod_id)
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- ============================================================
-- Admin_Info (10 rows)
-- ============================================================
INSERT INTO Admin_Info (emp_id, fname, lname, address, birthdate, email, phone) VALUES
('E001', 'Somchai',   'Kaewmanee',  '12 Sukhumvit Rd, Bangkok 10110',        '1990-03-15', 'somchai@glow.co.th',   '0812345001'),
('E002', 'Siriporn',  'Thongchai',  '45 Silom Rd, Bangkok 10500',            '1992-07-22', 'siriporn@glow.co.th',  '0812345002'),
('E003', 'Natthapol', 'Srisuk',     '88 Ratchada Rd, Bangkok 10310',         '1988-11-05', 'natthapol@glow.co.th', '0812345003'),
('E004', 'Warunee',   'Phongpan',   '23 Lat Phrao Rd, Bangkok 10230',        '1995-01-30', 'warunee@glow.co.th',   '0812345004'),
('E005', 'Pichaya',   'Moonkham',   '67 Phaholyothin Rd, Bangkok 10400',     '1993-09-18', 'pichaya@glow.co.th',   '0812345005'),
('E006', 'Kittipong', 'Rodprasert', '10 Chaengwattana Rd, Nonthaburi 11120', '1991-04-12', 'kittipong@glow.co.th', '0812345006'),
('E007', 'Napatsorn', 'Sakulrat',   '55 Bang Na Rd, Bangkok 10260',          '1994-06-08', 'napatsorn@glow.co.th', '0812345007'),
('E008', 'Thanakorn', 'Wichaidit',  '30 Ngam Wong Wan Rd, Nonthaburi 11000','1989-12-25', 'thanakorn@glow.co.th', '0812345008'),
('E009', 'Ratana',    'Chotirat',   '19 Rama IV Rd, Bangkok 10120',          '1996-02-14', 'ratana@glow.co.th',    '0812345009'),
('E010', 'Jirawat',   'Boonsri',    '77 Asok Rd, Bangkok 10110',             '1997-08-03', 'jirawat@glow.co.th',   '0812345010');

-- ============================================================
-- Admin_Login (10 rows)
-- ============================================================
INSERT INTO Admin_Login (log_id, username, login_password) VALUES
('E001', 'somchai@glow.co.th', 'Pass1234'),
('E002', 'siriporn@glow.co.th', 'Pass1234'),
('E003', 'natthapol@glow.co.th', 'Pass1234'),
('E004', 'warunee@glow.co.th', 'Pass1234'),
('E005', 'pichaya@glow.co.th', 'Pass1234'),
('E006', 'kittipong@glow.co.th', 'Pass1234'),
('E007', 'napatsorn@glow.co.th', 'Pass1234'),
('E008', 'thanakorn@glow.co.th', 'Pass1234'),
('E009', 'ratana@glow.co.th', 'Pass1234'),
('E010', 'jirawat@glow.co.th', 'Pass1234');

-- ============================================================
-- Login_log (10 rows)
-- ============================================================
INSERT INTO Login_log (log_id, login_time, logout_time, login_status) VALUES
('E001', '2026-04-01 09:00:00', '2026-04-01 17:30:00', 'succeed'),
('E002', '2026-04-01 08:45:00', '2026-04-01 16:00:00', 'succeed'),
('E003', '2026-04-02 10:15:00', '2026-04-02 18:00:00', 'succeed'),
('E004', '2026-04-02 09:30:00', '2026-04-02 17:00:00', 'succeed'),
('E005', '2026-04-03 08:00:00', '2026-04-03 15:30:00', 'succeed'),
('E006', '2026-04-03 11:00:00', '2026-04-03 11:05:00', 'failed'),
('E007', '2026-04-04 09:00:00', '2026-04-04 17:00:00', 'succeed'),
('E008', '2026-04-04 10:30:00', '2026-04-04 18:30:00', 'succeed'),
('E009', '2026-04-05 08:15:00', '2026-04-05 16:45:00', 'terminated'),
('E010', '2026-04-05 09:45:00', '2026-04-05 17:15:00', 'succeed');

-- ============================================================
-- Product (10 rows) — based on Figma product data
-- ============================================================
INSERT INTO Product (prod_id, prod_name, brand, category, price, details, how_to, ingredients, rating, spe_flag) VALUES
('P001', 'Volume Express Hyper Curl Waterproof Mascara',
 'MAYBELLINE NEW YORK', 'Makeup', 179.00,
 'Hyperfast hypercurling mascara that locks in 73% more curl and 3x volume with an 18-hour waterproof formula.',
 'Starting at the base, wiggle wand in a zigzag motion to the tips. Apply a second coat while still wet for more volume.',
 'Water, Beeswax, Carnauba Wax, Cetearyl Alcohol, Stearic Acid, Acacia Senegal Gum, Iron Oxides.',
 4, 'Dermatologically-tested'),

('P002', 'Fit Me Matte + Poreless Foundation',
 'MAYBELLINE NEW YORK', 'Makeup', 249.00,
 'Natural matte finish foundation that controls shine and minimizes pores. Dermatologist tested for normal to oily skin.',
 'Apply with fingers, brush, or sponge from center of face blending outward. Build coverage as desired.',
 'Water, Cyclopentasiloxane, Titanium Dioxide, Talc, Niacinamide, Dimethicone, Phenoxyethanol.',
 4, 'Dermatologically-tested'),

('P003', 'SuperStay Matte Ink Liquid Lipstick',
 'MAYBELLINE NEW YORK', 'Makeup', 249.00,
 'Up to 16-hour wear liquid lipstick with an intense matte finish. Lightweight and comfortable all day.',
 'Apply from cupid bow outward on upper lip, then fill lower lip. Let dry for 60 seconds.',
 'Isododecane, Dimethicone, Cyclopentasiloxane, Trimethylsiloxysilicate, Pigments.',
 4, 'Cruelty-free'),

('P004', 'Sky High Mascara',
 'MAYBELLINE NEW YORK', 'Makeup', 169.00,
 'Lengthening mascara infused with bamboo extract for flexible, sky-high length without clumping.',
 'Sweep wand from root to tip in one fluid motion. Build length with additional coats.',
 'Water, Beeswax, Paraffin, Bamboo Extract, Panthenol, Iron Oxides.',
 4, 'Cruelty-free'),

('P005', 'Heroine Make Volume & Curl Waterproof Mascara',
 'KISS ME', 'Makeup', 435.00,
 'Ultra waterproof formula that creates dramatic volume and curl that lasts all day without smudging.',
 'Apply from roots to tips with a gentle zigzag motion. Layer for more volume.',
 'Synthetic Beeswax, Paraffin, Carnauba Wax, Iron Oxides, Aqua.',
 4, 'Cruelty-free'),

('P006', 'Super Matte Pressed Powder',
 'NARIO LLARIAS', 'Makeup', 105.00,
 'Finely-milled pressed powder that controls oil and gives a smooth matte finish throughout the day.',
 'Apply with puff or brush over moisturizer or foundation. Reapply as needed to control shine.',
 'Talc, Mica, Magnesium Stearate, Dimethicone, Titanium Dioxide, Silica.',
 4, 'Dermatologically-tested'),

('P007', 'Tip Brow Pencil',
 'BROWIT', 'Makeup', 118.00,
 'Ultra-fine tip brow pencil for precise hair-stroke effect. Smudge-proof and long-lasting up to 12 hours.',
 'Use fine tip to draw short hair-like strokes following natural brow growth direction.',
 'Hydrogenated Polyisobutene, Synthetic Wax, Tocopheryl Acetate, Iron Oxides.',
 4, 'Cruelty-free'),

('P008', 'Contour Blush Palette',
 'HERREEZA', 'Makeup', 299.00,
 'Multi-shade palette with blush, bronzer, and highlighter for a sculpted, glowing complexion.',
 'Apply blush on apple of cheeks, bronzer on temples and jawline, highlighter on cheekbones.',
 'Talc, Mica, Magnesium Stearate, Silica, Titanium Dioxide, Pigments.',
 4, 'Cruelty-free'),

('P009', 'Han All Shadow Palette',
 'ROMAND', 'Makeup', 349.00,
 'Korean eyeshadow palette with 8 versatile shades ranging from matte to shimmer for everyday looks.',
 'Apply lighter shades on lid as base, medium shades on crease, darkest shade on outer corner.',
 'Talc, Mica, Boron Nitride, Caprylyl Glycol, Tocopherol, Pigments.',
 4, 'Cruelty-free'),

('P010', 'Advanced Snail 96 Mucin Power Essence',
 'COSRX', 'Skincare', 750.00,
 '96% snail secretion filtrate essence that repairs damaged skin, boosts hydration, and brightens complexion.',
 'After cleansing and toning, apply a small amount and gently pat into skin until fully absorbed. Use morning and night.',
 'Snail Secretion Filtrate 96%, Betaine, Sodium Hyaluronate, Allantoin, Panthenol, Sodium Polyacrylate.',
 5, 'Cruelty-free');

-- ============================================================
-- Product_Variant (10 rows)
-- ============================================================
INSERT INTO Product_Variant (prod_id, volume, color, quantity) VALUES
('P001', 9,  'Black',       150),
('P002', 30, 'Natural Buff',200),
('P003', 5,  'Red',         180),
('P004', 8,  'Blackest Black',220),
('P005', 7,  'Black',       100),
('P006', 10, 'Translucent', 300),
('P007', 4,  'Dark Brown',  250),
('P008', 15, 'Multi',       120),
('P009', 12, 'Multi',       130),
('P010', 100,'Clear',       175);

-- ============================================================
-- Product_Image (10 rows)
-- ============================================================
INSERT INTO Product_Image (prod_id, image_id, image_url) VALUES
('P001', 'IMG001', 'images/p001_mascara.jpg'),
('P002', 'IMG002', 'images/p002_foundation.jpg'),
('P003', 'IMG003', 'images/p003_lipstick.jpg'),
('P004', 'IMG004', 'images/p004_skyhigh.jpg'),
('P005', 'IMG005', 'images/p005_kissme.jpg'),
('P006', 'IMG006', 'images/p006_powder.jpg'),
('P007', 'IMG007', 'images/p007_brow.jpg'),
('P008', 'IMG008', 'images/p008_blush.jpg'),
('P009', 'IMG009', 'images/p009_shadow.jpg'),
('P010', 'IMG010', 'images/p010_cosrx.jpg');
