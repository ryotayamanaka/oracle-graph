-- Create a view, form_interest_view, because form_interest table does not have a key column

DROP VIEW coi_form_interest_with_key;

CREATE VIEW coi_form_interest_with_key AS
SELECT ROWNUM AS id, t.*
FROM coi_form_interest t
WHERE t.company_id IS NOT NULL;

-- Create phone-based relationships between employees and between employees and suppliers

CREATE VIEW coi_emergency_contact_1 AS
SELECT ROWNUM AS id, e1.employee_id AS employee_id_1, e2.employee_id AS employee_id_2
FROM coi_employee e1, coi_employee e2
WHERE e1.emergency_contact_phone = e2.phone;

UPDATE coi_employee SET emergency_contact_phone = '0452728884'
WHERE emergency_contact_name = 'Claudia';

CREATE VIEW coi_emergency_contact_2 AS
SELECT ROWNUM AS id, e.employee_id, s.company_id
FROM coi_employee e, coi_supplier s
WHERE e.emergency_contact_phone = s.PHONE;

UPDATE coi_employee SET emergency_contact_phone = '0451519526' -- Jacob Physiotherapy
WHERE employee_id = 'E600071'; -- Sarah Murphy

UPDATE coi_purchase SET approver_employee_id = 'E600023' -- Claudia
WHERE invoice_no = 'EHR-6006011357';

UPDATE coi_form_master SET employee_id = 'E601079' -- Erika
WHERE form_id = 'DPI-0116';

UPDATE coi_purchase SET approver_employee_id = 'E601080' -- Someone unrelated
WHERE invoice_no = 'EHR-600601461';

COMMIT;

-- Create distance-based relationship (needs geometry columns, metadata entries, indexes)

-- employee_geom

DROP TABLE coi_employee_geom;

CREATE TABLE coi_employee_geom AS
SELECT
  t.*,
  SDO_GEOMETRY(
    2001,       -- Geometry type (two-dementional point)
    4326,       -- Coordinate system ID (SRID) 
    SDO_POINT_TYPE(t.address_lon, t.address_lat, NULL),
    NULL,
    NULL
  ) AS address_geom
FROM coi_employee t;

INSERT INTO user_sdo_geom_metadata VALUES (
  'coi_employee_geom',
  'address_geom',
  SDO_DIM_ARRAY(
    SDO_DIM_ELEMENT('LONGITUDE', -180.0, 180.0, 0.05),
    SDO_DIM_ELEMENT('LATITUDE', -90.0, 90.0, 0.05)
  ),
  4326
);
COMMIT;
CREATE INDEX idx_coi_employee_geom ON coi_employee_geom (address_geom) INDEXTYPE IS mdsys.spatial_index_v2;

-- supplier_geom

DROP TABLE coi_supplier_geom;

CREATE TABLE coi_supplier_geom AS
SELECT
  t.*,
  SDO_GEOMETRY(
    2001,       -- Geometry type (two-dementional point)
    4326,       -- Coordinate system ID (SRID) 
    SDO_POINT_TYPE(t.address_lon, t.address_lat, NULL),
    NULL,
    NULL
  ) AS address_geom
FROM coi_supplier t;

INSERT INTO user_sdo_geom_metadata VALUES (
  'coi_supplier_geom',
  'address_geom',
  SDO_DIM_ARRAY(
    SDO_DIM_ELEMENT('LONGITUDE', -180.0, 180.0, 0.05),
    SDO_DIM_ELEMENT('LATITUDE', -90.0, 90.0, 0.05)
  ),
  4326
);
COMMIT;
CREATE INDEX idx_coi_supplier_geom ON coi_supplier_geom (address_geom) INDEXTYPE IS mdsys.spatial_index_v2;

-- distance

CREATE VIEW coi_within_500m AS
SELECT ROWNUM AS id, e.employee_id, s.company_id,
       SDO_GEOM.SDO_DISTANCE(e.address_geom, s.address_geom, 0.05, 'unit=M') AS dist
FROM coi_employee_geom e, coi_supplier_geom s
WHERE SDO_GEOM.SDO_DISTANCE(e.address_geom, s.address_geom, 0.05, 'unit=M') < 500;

-- Add purchases between geographically close entities (a supplier and an employee)

UPDATE coi_purchase SET company_id = 'ABN 44 352 560 555'
WHERE invoice_no = 'EHR-6006011023';

UPDATE coi_purchase SET supplier_id = 'S3051'
WHERE invoice_no = 'EHR-6006011023';

UPDATE coi_purchase SET approver_employee_id = 'E600066'
WHERE invoice_no = 'EHR-6006011623';

UPDATE coi_purchase SET approver_employee_id = 'E600066'
WHERE invoice_no = 'EHR-6006011265';

COMMIT;
