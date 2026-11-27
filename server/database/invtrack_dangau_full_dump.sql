--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_opnames DROP CONSTRAINT IF EXISTS stock_opnames_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_opnames DROP CONSTRAINT IF EXISTS stock_opnames_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_opname_items DROP CONSTRAINT IF EXISTS stock_opname_items_stock_opname_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_opname_items DROP CONSTRAINT IF EXISTS stock_opname_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_visibilities DROP CONSTRAINT IF EXISTS role_visibilities_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_requests DROP CONSTRAINT IF EXISTS purchase_requests_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_requests DROP CONSTRAINT IF EXISTS purchase_requests_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_request_items DROP CONSTRAINT IF EXISTS purchase_request_items_purchase_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_request_items DROP CONSTRAINT IF EXISTS purchase_request_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_purchase_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_unit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_price_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_po_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipt_items DROP CONSTRAINT IF EXISTS goods_receipt_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipt_items DROP CONSTRAINT IF EXISTS goods_receipt_items_goods_receipt_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_issues DROP CONSTRAINT IF EXISTS goods_issues_warehouse_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_issues DROP CONSTRAINT IF EXISTS goods_issues_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_issue_items DROP CONSTRAINT IF EXISTS goods_issue_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.goods_issue_items DROP CONSTRAINT IF EXISTS goods_issue_items_goods_issue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.warehouses DROP CONSTRAINT IF EXISTS warehouses_warehouse_code_key;
ALTER TABLE IF EXISTS ONLY public.warehouses DROP CONSTRAINT IF EXISTS warehouses_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.units DROP CONSTRAINT IF EXISTS units_unit_name_key;
ALTER TABLE IF EXISTS ONLY public.units DROP CONSTRAINT IF EXISTS units_pkey;
ALTER TABLE IF EXISTS ONLY public.role_visibilities DROP CONSTRAINT IF EXISTS unique_role_visibility;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS unique_item_warehouse;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_opnames DROP CONSTRAINT IF EXISTS stock_opnames_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_opnames DROP CONSTRAINT IF EXISTS stock_opnames_opname_number_key;
ALTER TABLE IF EXISTS ONLY public.stock_opname_items DROP CONSTRAINT IF EXISTS stock_opname_items_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_role_name_key;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_visibilities DROP CONSTRAINT IF EXISTS role_visibilities_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_requests DROP CONSTRAINT IF EXISTS purchase_requests_pr_number_key;
ALTER TABLE IF EXISTS ONLY public.purchase_requests DROP CONSTRAINT IF EXISTS purchase_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_request_items DROP CONSTRAINT IF EXISTS purchase_request_items_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_po_number_key;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_sku_key;
ALTER TABLE IF EXISTS ONLY public.items DROP CONSTRAINT IF EXISTS items_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory DROP CONSTRAINT IF EXISTS inventory_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_pkey;
ALTER TABLE IF EXISTS ONLY public.goods_receipts DROP CONSTRAINT IF EXISTS goods_receipts_gr_number_key;
ALTER TABLE IF EXISTS ONLY public.goods_receipt_items DROP CONSTRAINT IF EXISTS goods_receipt_items_pkey;
ALTER TABLE IF EXISTS ONLY public.goods_issues DROP CONSTRAINT IF EXISTS goods_issues_pkey;
ALTER TABLE IF EXISTS ONLY public.goods_issues DROP CONSTRAINT IF EXISTS goods_issues_gi_number_key;
ALTER TABLE IF EXISTS ONLY public.goods_issue_items DROP CONSTRAINT IF EXISTS goods_issue_items_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_category_name_key;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
ALTER TABLE IF EXISTS public.warehouses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.units ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.suppliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_opnames ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_opname_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.role_visibilities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_request_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.purchase_order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory_movements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.goods_receipts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.goods_receipt_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.goods_issues ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.goods_issue_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.warehouses_id_seq;
DROP TABLE IF EXISTS public.warehouses;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.units_id_seq;
DROP TABLE IF EXISTS public.units;
DROP SEQUENCE IF EXISTS public.suppliers_id_seq;
DROP TABLE IF EXISTS public.suppliers;
DROP SEQUENCE IF EXISTS public.stock_opnames_id_seq;
DROP TABLE IF EXISTS public.stock_opnames;
DROP SEQUENCE IF EXISTS public.stock_opname_items_id_seq;
DROP TABLE IF EXISTS public.stock_opname_items;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.role_visibilities_id_seq;
DROP TABLE IF EXISTS public.role_visibilities;
DROP SEQUENCE IF EXISTS public.purchase_requests_id_seq;
DROP TABLE IF EXISTS public.purchase_requests;
DROP SEQUENCE IF EXISTS public.purchase_request_items_id_seq;
DROP TABLE IF EXISTS public.purchase_request_items;
DROP SEQUENCE IF EXISTS public.purchase_orders_id_seq;
DROP TABLE IF EXISTS public.purchase_orders;
DROP SEQUENCE IF EXISTS public.purchase_order_items_id_seq;
DROP TABLE IF EXISTS public.purchase_order_items;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.items_id_seq;
DROP TABLE IF EXISTS public.items;
DROP SEQUENCE IF EXISTS public.inventory_movements_id_seq;
DROP TABLE IF EXISTS public.inventory_movements;
DROP SEQUENCE IF EXISTS public.inventory_id_seq;
DROP TABLE IF EXISTS public.inventory;
DROP SEQUENCE IF EXISTS public.goods_receipts_id_seq;
DROP TABLE IF EXISTS public.goods_receipts;
DROP SEQUENCE IF EXISTS public.goods_receipt_items_id_seq;
DROP TABLE IF EXISTS public.goods_receipt_items;
DROP SEQUENCE IF EXISTS public.goods_issues_id_seq;
DROP TABLE IF EXISTS public.goods_issues;
DROP SEQUENCE IF EXISTS public.goods_issue_items_id_seq;
DROP TABLE IF EXISTS public.goods_issue_items;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    activity_type character varying(50) NOT NULL,
    description text NOT NULL,
    reference_id character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    category_name character varying(100) NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: goods_issue_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_issue_items (
    id integer NOT NULL,
    goods_issue_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_name character varying(20)
);


--
-- Name: goods_issue_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_issue_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_issue_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_issue_items_id_seq OWNED BY public.goods_issue_items.id;


--
-- Name: goods_issues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_issues (
    id integer NOT NULL,
    gi_number character varying(50) NOT NULL,
    warehouse_id integer NOT NULL,
    requester_name character varying(100) NOT NULL,
    outlet_name character varying(100) NOT NULL,
    issue_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(30) DEFAULT 'Selesai'::character varying,
    notes text,
    created_by integer NOT NULL,
    attachment_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: goods_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_issues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_issues_id_seq OWNED BY public.goods_issues.id;


--
-- Name: goods_receipt_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipt_items (
    id integer NOT NULL,
    goods_receipt_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_name character varying(20),
    unit_price numeric(15,2) DEFAULT 0,
    total_price numeric(15,2) DEFAULT 0
);


--
-- Name: goods_receipt_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipt_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipt_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipt_items_id_seq OWNED BY public.goods_receipt_items.id;


--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipts (
    id integer NOT NULL,
    gr_number character varying(50) NOT NULL,
    po_id integer,
    supplier_id integer,
    warehouse_id integer NOT NULL,
    receipt_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    created_by integer NOT NULL,
    attachment_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(15,2) DEFAULT 0,
    is_price_verified boolean DEFAULT false,
    price_verified_by integer,
    price_verified_at timestamp without time zone
);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipts_id_seq OWNED BY public.goods_receipts.id;


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    current_stock numeric(10,2) DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_id_seq OWNED BY public.inventory.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    item_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    transaction_type character varying(20) NOT NULL,
    reference_id character varying(50) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    stock_before numeric(10,2) NOT NULL,
    stock_after numeric(10,2) NOT NULL,
    created_by integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id integer NOT NULL,
    sku character varying(50) NOT NULL,
    item_name character varying(150) NOT NULL,
    category_id integer NOT NULL,
    unit_id integer NOT NULL,
    minimum_stock numeric(10,2) DEFAULT 10,
    critical_stock numeric(10,2) DEFAULT 5,
    unit_price numeric(15,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiry_date date
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    target_role character varying(50),
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'INFO'::character varying,
    link character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(15,2) DEFAULT 0,
    total_price numeric(15,2) DEFAULT 0
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    po_number character varying(50) NOT NULL,
    purchase_request_id integer,
    supplier_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    po_date date DEFAULT CURRENT_DATE,
    status character varying(30) DEFAULT 'Dipesan'::character varying,
    total_amount numeric(15,2) DEFAULT 0,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: purchase_request_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_request_items (
    id integer NOT NULL,
    purchase_request_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    urgency character varying(20) DEFAULT 'Normal'::character varying,
    status character varying(30) DEFAULT 'Menunggu'::character varying
);


--
-- Name: purchase_request_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_request_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_request_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_request_items_id_seq OWNED BY public.purchase_request_items.id;


--
-- Name: purchase_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_requests (
    id integer NOT NULL,
    pr_number character varying(50) NOT NULL,
    user_id integer NOT NULL,
    warehouse_id integer NOT NULL,
    status character varying(30) DEFAULT 'Menunggu'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rejection_reason text
);


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_requests_id_seq OWNED BY public.purchase_requests.id;


--
-- Name: role_visibilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_visibilities (
    id integer NOT NULL,
    role_id integer,
    can_barang_masuk boolean DEFAULT true,
    can_barang_keluar boolean DEFAULT true,
    can_permintaan_pembelian boolean DEFAULT true,
    can_pesanan_pembelian boolean DEFAULT true,
    can_stok_opname boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: role_visibilities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_visibilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_visibilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_visibilities_id_seq OWNED BY public.role_visibilities.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: stock_opname_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_opname_items (
    id integer NOT NULL,
    stock_opname_id integer NOT NULL,
    item_id integer NOT NULL,
    system_stock numeric(10,2) NOT NULL,
    physical_stock numeric(10,2) NOT NULL,
    difference numeric(10,2) NOT NULL,
    reason text
);


--
-- Name: stock_opname_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_opname_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_opname_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_opname_items_id_seq OWNED BY public.stock_opname_items.id;


--
-- Name: stock_opnames; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_opnames (
    id integer NOT NULL,
    opname_number character varying(50) NOT NULL,
    warehouse_id integer NOT NULL,
    user_id integer NOT NULL,
    opname_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(30) DEFAULT 'Selesai'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: stock_opnames_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_opnames_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_opnames_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_opnames_id_seq OWNED BY public.stock_opnames.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    supplier_name character varying(150) NOT NULL,
    contact character varying(50),
    address text,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units (
    id integer NOT NULL,
    unit_name character varying(20) NOT NULL
);


--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role_id integer NOT NULL,
    warehouse_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone character varying(30),
    is_active boolean DEFAULT true
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    warehouse_code character varying(20) NOT NULL,
    warehouse_name character varying(100) NOT NULL,
    location character varying(255),
    status character varying(20) DEFAULT 'Active'::character varying
);


--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: goods_issue_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_items ALTER COLUMN id SET DEFAULT nextval('public.goods_issue_items_id_seq'::regclass);


--
-- Name: goods_issues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues ALTER COLUMN id SET DEFAULT nextval('public.goods_issues_id_seq'::regclass);


--
-- Name: goods_receipt_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items ALTER COLUMN id SET DEFAULT nextval('public.goods_receipt_items_id_seq'::regclass);


--
-- Name: goods_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts ALTER COLUMN id SET DEFAULT nextval('public.goods_receipts_id_seq'::regclass);


--
-- Name: inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory ALTER COLUMN id SET DEFAULT nextval('public.inventory_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: purchase_request_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_request_items_id_seq'::regclass);


--
-- Name: purchase_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests ALTER COLUMN id SET DEFAULT nextval('public.purchase_requests_id_seq'::regclass);


--
-- Name: role_visibilities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_visibilities ALTER COLUMN id SET DEFAULT nextval('public.role_visibilities_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: stock_opname_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opname_items ALTER COLUMN id SET DEFAULT nextval('public.stock_opname_items_id_seq'::regclass);


--
-- Name: stock_opnames id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opnames ALTER COLUMN id SET DEFAULT nextval('public.stock_opnames_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.activity_logs VALUES (1, 3, 'GOODS_RECEIPT', 'Petugas Gudang menambahkan penerimaan GR-2026-0001 (100.00 KG Tepung Terigu)', 'GR-2026-0001', '2026-10-06 14:52:47.797618');
INSERT INTO public.activity_logs VALUES (2, 3, 'GOODS_ISSUE', 'Petugas Gudang mencatat barang keluar OUT-2026-0001 (Warung Dangau)', 'OUT-2026-0001', '2026-10-07 02:52:47.797618');
INSERT INTO public.activity_logs VALUES (3, 2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-002', 'PR-2026-002', '2026-10-04 14:52:47.797618');
INSERT INTO public.activity_logs VALUES (4, 3, 'STOCK_OPNAME', 'Petugas Gudang & Accounting melakukan stock opname Gudang Dangau', 'SO-2026-001', '2026-10-03 14:52:47.797618');
INSERT INTO public.activity_logs VALUES (5, 2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-002, stok bertambah, dan menerbitkan PO-2026-0003', 'PO-2026-0003', '2026-10-07 15:48:44.441354');
INSERT INTO public.activity_logs VALUES (6, 2, 'GOODS_ISSUE', 'Accounting Supervisor (Admin) mencatat Pengambilan Barang OUT OUT-20261007-0003 (Tanggooe Pizzeria): Tepung Terigu Premium 1kg (-25 KG), Tomato Paste Canned 1kg (-12 PCS), Mozzarella Cheese Block (-5.5 KG), Tepung Terigu Premium 1kg (-1 KG)', 'OUT-20261007-0003', '2026-10-07 15:49:25.211709');
INSERT INTO public.activity_logs VALUES (7, 3, 'GOODS_RECEIPT', 'Budi Santoso (Petugas Gudang) mencatat Penerimaan Barang Masuk GR-20261007-0002: Tepung Terigu Premium 1kg (+10 KG)', 'GR-20261007-0002', '2026-10-07 20:35:39.79555');
INSERT INTO public.activity_logs VALUES (8, 2, 'GOODS_RECEIPT', 'Accounting Supervisor (Admin) mencatat Penerimaan Barang Masuk GR-20261010-0003: Minyak Goreng Refill 5L (+20 Btl)', 'GR-20261010-0003', '2026-10-10 21:47:13.089682');
INSERT INTO public.activity_logs VALUES (9, 2, 'GOODS_ISSUE', 'Accounting Supervisor (Admin) mencatat Pengambilan Barang OUT OUT-20261010-0004 (Warung Dangau): Semen Gresik 40kg (-1 Sak)', 'OUT-20261010-0004', '2026-10-10 22:24:12.634438');
INSERT INTO public.activity_logs VALUES (10, 2, 'PURCHASE_ORDER', 'Membuat Purchase Order PO-2026-0004 (Total: Rp 93.999,9)', 'PO-2026-0004', '2026-10-10 22:27:35.376277');
INSERT INTO public.activity_logs VALUES (11, 2, 'PURCHASE_ORDER', 'Membuat Purchase Order PO-2026-0005 (Total: Rp 14.000)', 'PO-2026-0005', '2026-10-25 10:55:45.170298');
INSERT INTO public.activity_logs VALUES (12, 2, 'PURCHASE_ORDER', 'Membuat Purchase Order PO-2026-0006 (Total: Rp 140.000)', 'PO-2026-0006', '2026-10-25 13:56:38.497711');
INSERT INTO public.activity_logs VALUES (13, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-005', 'PR-2026-005', '2026-10-25 14:00:01.693064');
INSERT INTO public.activity_logs VALUES (14, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-006', 'PR-2026-006', '2026-10-25 14:00:15.561492');
INSERT INTO public.activity_logs VALUES (15, 2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-006, stok bertambah, dan menerbitkan PO-2026-0007', 'PO-2026-0007', '2026-10-25 15:35:17.738275');
INSERT INTO public.activity_logs VALUES (16, 2, 'PURCHASE_REJECTION', 'Admin menolak Purchase Request ID 4: Stok masih tersedia di gudang lain', '4', '2026-10-25 16:12:49.626992');
INSERT INTO public.activity_logs VALUES (17, 2, 'PURCHASE_REJECTION', 'Admin menolak Purchase Request ID 3: Ditolak oleh Admin Accounting', '3', '2026-10-25 16:14:17.968557');
INSERT INTO public.activity_logs VALUES (18, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-007', 'PR-2026-007', '2026-10-25 16:14:54.227394');
INSERT INTO public.activity_logs VALUES (19, 2, 'PURCHASE_REJECTION', 'Admin menolak Purchase Request ID 7: Ditolak oleh Admin Accounting', '7', '2026-10-25 16:19:37.19798');
INSERT INTO public.activity_logs VALUES (20, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-008', 'PR-2026-008', '2026-10-25 16:20:15.513845');
INSERT INTO public.activity_logs VALUES (21, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-009', 'PR-2026-009', '2026-10-25 16:20:43.99356');
INSERT INTO public.activity_logs VALUES (22, 2, 'PURCHASE_REJECTION', 'Admin menolak Purchase Request ID 9: Ditolak oleh Admin Accounting', '9', '2026-10-25 16:21:00.031858');
INSERT INTO public.activity_logs VALUES (23, 2, 'PURCHASE_REJECTION', 'Admin menolak Purchase Request ID 8: Ditolak oleh Admin Accounting', '8', '2026-10-25 16:22:08.453223');
INSERT INTO public.activity_logs VALUES (24, 3, 'GOODS_RECEIPT', 'Budi Santoso (Petugas Gudang) mencatat Penerimaan Barang Masuk GR-20261102-0004: Tepung Terigu Premium 1kg (+10 KG)', 'GR-20261102-0004', '2026-11-02 18:24:32.640681');
INSERT INTO public.activity_logs VALUES (25, 3, 'GOODS_RECEIPT', 'Budi Santoso (Petugas Gudang) mencatat Penerimaan Barang Masuk GR-20261102-0005: Tepung Terigu Premium 1kg (+10 KG)', 'GR-20261102-0005', '2026-11-02 18:25:17.185975');
INSERT INTO public.activity_logs VALUES (26, 2, 'GOODS_RECEIPT', 'Admin Accounting mencatat Penerimaan Barang Masuk GR-20261102-0006: Tepung Terigu Premium 1kg (+5 KG)', 'GR-20261102-0006', '2026-11-02 18:34:34.148217');
INSERT INTO public.activity_logs VALUES (27, 2, 'GOODS_ISSUE', 'Admin Accounting mencatat Pengambilan Barang OUT OUT-20261102-0005 (Warung Dangau): Tepung Terigu Premium 1kg (-3 KG)', 'OUT-20261102-0005', '2026-11-02 18:34:34.268181');
INSERT INTO public.activity_logs VALUES (28, 2, 'GOODS_RECEIPT', 'Admin Accounting mencatat Penerimaan Barang Masuk GR-20261102-0007: Tepung Terigu Premium 1kg (+5 KG)', 'GR-20261102-0007', '2026-11-02 18:35:36.15727');
INSERT INTO public.activity_logs VALUES (29, 2, 'GOODS_ISSUE', 'Admin Accounting mencatat Pengambilan Barang OUT OUT-20261102-0006 (Warung Dangau): Tepung Terigu Premium 1kg (-3 KG)', 'OUT-20261102-0006', '2026-11-02 18:35:36.266893');
INSERT INTO public.activity_logs VALUES (30, 2, 'STOCK_OPNAME', 'Admin Accounting melakukan Stock Opname SO-2026-002: Tepung Terigu Premium 1kg (Sistem: 128, Fisik: 150, Selisih: 22)', 'SO-2026-002', '2026-11-02 18:35:36.282633');
INSERT INTO public.activity_logs VALUES (31, 1, 'GOODS_RECEIPT', 'Accounting Manager (Master) mencatat Penerimaan Barang Masuk GR-20261107-0008: Tepung Terigu Premium 1kg (+5 KG)', 'GR-20261107-0008', '2026-11-07 13:35:14.927606');
INSERT INTO public.activity_logs VALUES (32, 1, 'GOODS_ISSUE', 'Accounting Manager (Master) mencatat Pengambilan Barang OUT OUT-20261107-0007 (Resto Dangau): Tepung Terigu Premium 1kg (-5 KG)', 'OUT-20261107-0007', '2026-11-07 13:35:15.032289');
INSERT INTO public.activity_logs VALUES (33, 1, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-002', 'PR-2026-002', '2026-11-08 14:45:28.155217');
INSERT INTO public.activity_logs VALUES (34, 2, 'PRICE_VERIFICATION', 'Accounting Supervisor (Admin) (Accounting) mengisi & memverifikasi harga GR-202611-0004 (Total: Rp 290.000): BAYCLIN (12): Rp 14.500', 'GR-202611-0004', '2026-11-23 11:19:59.044789');
INSERT INTO public.activity_logs VALUES (35, 2, 'PRICE_VERIFICATION', 'Accounting Supervisor (Admin) (Accounting) mengisi & memverifikasi harga GR-202611-0005 (Total: Rp 925.000): ALAT PEMANGGANG: Rp 185.000', 'GR-202611-0005', '2026-11-23 11:39:21.245399');
INSERT INTO public.activity_logs VALUES (36, 3, 'CREATE_ITEM', 'Menambahkan barang baru: TEST ITEM DANGAU (ITM-1795409462586-170)', 'ITM-1795409462586-170', '2026-11-23 11:51:02.587271');
INSERT INTO public.activity_logs VALUES (37, 3, 'IMPORT_EXCEL', 'Impor database Excel: 2 barang baru, 0 persediaan diperbarui', 'EXCEL-1795410302795', '2026-11-23 12:05:02.757654');
INSERT INTO public.activity_logs VALUES (38, 3, 'IMPORT_EXCEL', 'Impor database Excel: 0 barang baru, 1 persediaan diperbarui', 'EXCEL-1795410311372', '2026-11-23 12:05:11.367295');
INSERT INTO public.activity_logs VALUES (39, 2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-002, stok bertambah, dan menerbitkan PO-2026-0002', 'PO-2026-0002', '2026-11-27 05:23:39.643699');
INSERT INTO public.activity_logs VALUES (40, 3, 'PURCHASE_REQUEST', 'Membuat Permintaan Pembelian PR-2026-003', 'PR-2026-003', '2026-11-27 05:43:24.932087');
INSERT INTO public.activity_logs VALUES (41, 2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-003, stok bertambah, dan menerbitkan PO-2026-0003', 'PO-2026-0003', '2026-11-27 05:43:45.458815');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, 'Bahan Makanan & F&B');
INSERT INTO public.categories VALUES (2, 'Peralatan & Amenities Kamar');
INSERT INTO public.categories VALUES (3, 'Pembersih & Hygiene');
INSERT INTO public.categories VALUES (4, 'Maintenance & Engineering');
INSERT INTO public.categories VALUES (5, 'Perlengkapan Kantor');


--
-- Data for Name: goods_issue_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.goods_issue_items VALUES (1, 1, 11, 4.00, 'KG');
INSERT INTO public.goods_issue_items VALUES (2, 1, 1, 2.00, 'PCS');
INSERT INTO public.goods_issue_items VALUES (3, 2, 127, 80.00, 'Psg');
INSERT INTO public.goods_issue_items VALUES (4, 2, 34, 2.00, 'PCS');
INSERT INTO public.goods_issue_items VALUES (5, 3, 153, 10.00, 'PCS');
INSERT INTO public.goods_issue_items VALUES (6, 4, 8, 5.00, 'PCS');


--
-- Data for Name: goods_issues; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.goods_issues VALUES (1, 'GI-202611-0001', 1, 'Chef Rudi', 'Warung Dangau', '2026-11-07 02:36:44.495425', 'Disetujui', 'Bahan masak sarapan resto Warung Dangau', 3, NULL, '2026-11-07 20:36:44.495425');
INSERT INTO public.goods_issues VALUES (2, 'GI-202611-0002', 1, 'Supervisor Linda', 'Hotel Dangau', '2026-11-07 16:36:44.498969', 'Disetujui', 'Drop sandal dan amenities kamar Hotel Dangau', 3, NULL, '2026-11-07 20:36:44.498969');
INSERT INTO public.goods_issues VALUES (3, 'GI-202611-0003', 2, 'Agus Staff', 'Tanggooe Pizzeria', '2026-11-07 19:36:44.501396', 'Disetujui', 'Kebutuhan minuman resto Tanggooe Pizzeria', 1, NULL, '2026-11-07 20:36:44.501396');
INSERT INTO public.goods_issues VALUES (4, 'GI-202611-0004', 1, 'Hendra Logistik', 'Randayan', '2026-11-08 11:57:41.844502', 'Disetujui', 'Suplai logistik persediaan operasional Randayan', 1, NULL, '2026-11-08 12:27:41.844502');


--
-- Data for Name: goods_receipt_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.goods_receipt_items VALUES (2, 1, 1, 10.00, 'PCS', 25750.00, 257500.00);
INSERT INTO public.goods_receipt_items VALUES (1, 1, 11, 16.00, 'KG', 17250.00, 276000.00);
INSERT INTO public.goods_receipt_items VALUES (3, 2, 127, 500.00, 'Psg', 3300.00, 1650000.00);
INSERT INTO public.goods_receipt_items VALUES (4, 3, 153, 24.00, 'PCS', 661.00, 15864.00);
INSERT INTO public.goods_receipt_items VALUES (5, 4, 8, 20.00, 'Btl', 14500.00, 290000.00);
INSERT INTO public.goods_receipt_items VALUES (6, 6, 3, 5.00, 'Roll', 185000.00, 925000.00);


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.goods_receipts VALUES (1, 'GR-202611-0001', 1, 2, 1, '2026-11-06 20:36:44.48339', 'Penerimaan stok bahan makanan resto Dangau', 3, NULL, '2026-11-07 20:36:44.48339', 533500.00, true, NULL, NULL);
INSERT INTO public.goods_receipts VALUES (2, 'GR-202611-0002', NULL, 1, 1, '2026-11-07 15:36:44.488603', 'Penerimaan amenities kamar hotel Dangau', 3, NULL, '2026-11-07 20:36:44.488603', 1650000.00, true, NULL, NULL);
INSERT INTO public.goods_receipts VALUES (3, 'GR-202611-0003', NULL, 3, 2, '2026-11-07 18:36:44.491175', 'Penerimaan persediaan gudang White House', 1, NULL, '2026-11-07 20:36:44.491175', 15864.00, true, NULL, NULL);
INSERT INTO public.goods_receipts VALUES (4, 'GR-202611-0004', NULL, 1, 1, '2026-11-23 10:38:49.554058', 'Barang baru diterima fisik oleh Petugas Gudang. Wajib input harga oleh Accounting.', 3, NULL, '2026-11-23 11:13:49.554058', 290000.00, true, 2, '2026-11-23 11:19:59.044789');
INSERT INTO public.goods_receipts VALUES (6, 'GR-202611-0005', NULL, 1, 1, '2026-11-23 11:20:48.500564', 'Barang fisik baru diantar supplier & dicek Gudang. Menunggu faktur & input harga oleh Accounting.', 3, NULL, '2026-11-23 11:20:48.500564', 925000.00, true, 2, '2026-11-23 11:39:21.245399');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory VALUES (1, 1, 1, 37.00, '2026-11-07 20:36:43.181782');
INSERT INTO public.inventory VALUES (2, 1, 2, 0.00, '2026-11-07 20:36:43.183578');
INSERT INTO public.inventory VALUES (3, 2, 1, 0.00, '2026-11-07 20:36:43.186401');
INSERT INTO public.inventory VALUES (4, 2, 2, 0.00, '2026-11-07 20:36:43.187381');
INSERT INTO public.inventory VALUES (5, 3, 1, 1.00, '2026-11-07 20:36:43.190316');
INSERT INTO public.inventory VALUES (6, 3, 2, 0.00, '2026-11-07 20:36:43.191491');
INSERT INTO public.inventory VALUES (7, 4, 1, 4.00, '2026-11-07 20:36:43.194283');
INSERT INTO public.inventory VALUES (8, 4, 2, 0.00, '2026-11-07 20:36:43.195365');
INSERT INTO public.inventory VALUES (9, 5, 1, 0.00, '2026-11-07 20:36:43.197674');
INSERT INTO public.inventory VALUES (10, 5, 2, 0.00, '2026-11-07 20:36:43.198426');
INSERT INTO public.inventory VALUES (11, 6, 1, 9.00, '2026-11-07 20:36:43.200133');
INSERT INTO public.inventory VALUES (12, 6, 2, 0.00, '2026-11-07 20:36:43.200834');
INSERT INTO public.inventory VALUES (13, 7, 1, 3.00, '2026-11-07 20:36:43.202562');
INSERT INTO public.inventory VALUES (14, 7, 2, 0.00, '2026-11-07 20:36:43.203578');
INSERT INTO public.inventory VALUES (15, 8, 1, 23.00, '2026-11-07 20:36:43.205745');
INSERT INTO public.inventory VALUES (16, 8, 2, 0.00, '2026-11-07 20:36:43.206426');
INSERT INTO public.inventory VALUES (17, 9, 1, 23.00, '2026-11-07 20:36:43.208059');
INSERT INTO public.inventory VALUES (18, 9, 2, 0.00, '2026-11-07 20:36:43.209134');
INSERT INTO public.inventory VALUES (19, 10, 1, 0.00, '2026-11-07 20:36:43.21149');
INSERT INTO public.inventory VALUES (20, 10, 2, 0.00, '2026-11-07 20:36:43.212415');
INSERT INTO public.inventory VALUES (21, 11, 1, 16.00, '2026-11-07 20:36:43.214208');
INSERT INTO public.inventory VALUES (22, 11, 2, 0.00, '2026-11-07 20:36:43.214933');
INSERT INTO public.inventory VALUES (23, 12, 1, 0.00, '2026-11-07 20:36:43.216405');
INSERT INTO public.inventory VALUES (24, 12, 2, 0.00, '2026-11-07 20:36:43.216979');
INSERT INTO public.inventory VALUES (25, 13, 1, 0.00, '2026-11-07 20:36:43.218889');
INSERT INTO public.inventory VALUES (26, 13, 2, 0.00, '2026-11-07 20:36:43.219678');
INSERT INTO public.inventory VALUES (27, 14, 1, 0.00, '2026-11-07 20:36:43.221962');
INSERT INTO public.inventory VALUES (28, 14, 2, 0.00, '2026-11-07 20:36:43.222919');
INSERT INTO public.inventory VALUES (29, 15, 1, 594.00, '2026-11-07 20:36:43.224669');
INSERT INTO public.inventory VALUES (30, 15, 2, 0.00, '2026-11-07 20:36:43.225426');
INSERT INTO public.inventory VALUES (31, 16, 1, 7.00, '2026-11-07 20:36:43.2275');
INSERT INTO public.inventory VALUES (32, 16, 2, 0.00, '2026-11-07 20:36:43.228259');
INSERT INTO public.inventory VALUES (33, 17, 1, 0.00, '2026-11-07 20:36:43.230403');
INSERT INTO public.inventory VALUES (34, 17, 2, 0.00, '2026-11-07 20:36:43.23132');
INSERT INTO public.inventory VALUES (35, 18, 1, 0.00, '2026-11-07 20:36:43.23315');
INSERT INTO public.inventory VALUES (36, 18, 2, 0.00, '2026-11-07 20:36:43.234102');
INSERT INTO public.inventory VALUES (37, 19, 1, 0.00, '2026-11-07 20:36:43.236427');
INSERT INTO public.inventory VALUES (38, 19, 2, 0.00, '2026-11-07 20:36:43.237425');
INSERT INTO public.inventory VALUES (39, 20, 1, 480.00, '2026-11-07 20:36:43.239252');
INSERT INTO public.inventory VALUES (40, 20, 2, 0.00, '2026-11-07 20:36:43.240012');
INSERT INTO public.inventory VALUES (41, 21, 1, 0.00, '2026-11-07 20:36:43.242525');
INSERT INTO public.inventory VALUES (42, 21, 2, 0.00, '2026-11-07 20:36:43.243788');
INSERT INTO public.inventory VALUES (43, 22, 1, 45.00, '2026-11-07 20:36:43.24623');
INSERT INTO public.inventory VALUES (44, 22, 2, 0.00, '2026-11-07 20:36:43.247248');
INSERT INTO public.inventory VALUES (45, 23, 1, 1.00, '2026-11-07 20:36:43.249377');
INSERT INTO public.inventory VALUES (46, 23, 2, 0.00, '2026-11-07 20:36:43.250215');
INSERT INTO public.inventory VALUES (47, 24, 1, 1399.00, '2026-11-07 20:36:43.252637');
INSERT INTO public.inventory VALUES (48, 24, 2, 0.00, '2026-11-07 20:36:43.253476');
INSERT INTO public.inventory VALUES (49, 25, 1, 360.00, '2026-11-07 20:36:43.255627');
INSERT INTO public.inventory VALUES (50, 25, 2, 0.00, '2026-11-07 20:36:43.25641');
INSERT INTO public.inventory VALUES (51, 26, 1, 5.00, '2026-11-07 20:36:43.25809');
INSERT INTO public.inventory VALUES (52, 26, 2, 0.00, '2026-11-07 20:36:43.258693');
INSERT INTO public.inventory VALUES (53, 27, 1, 0.00, '2026-11-07 20:36:43.260547');
INSERT INTO public.inventory VALUES (54, 27, 2, 0.00, '2026-11-07 20:36:43.261953');
INSERT INTO public.inventory VALUES (55, 28, 1, 0.00, '2026-11-07 20:36:43.265068');
INSERT INTO public.inventory VALUES (56, 28, 2, 0.00, '2026-11-07 20:36:43.266507');
INSERT INTO public.inventory VALUES (57, 29, 1, 0.00, '2026-11-07 20:36:43.269241');
INSERT INTO public.inventory VALUES (58, 29, 2, 0.00, '2026-11-07 20:36:43.270157');
INSERT INTO public.inventory VALUES (59, 30, 1, 8.00, '2026-11-07 20:36:43.273073');
INSERT INTO public.inventory VALUES (60, 30, 2, 0.00, '2026-11-07 20:36:43.274947');
INSERT INTO public.inventory VALUES (61, 31, 1, 8.00, '2026-11-07 20:36:43.281127');
INSERT INTO public.inventory VALUES (62, 31, 2, 0.00, '2026-11-07 20:36:43.282195');
INSERT INTO public.inventory VALUES (63, 32, 1, 4.00, '2026-11-07 20:36:43.284403');
INSERT INTO public.inventory VALUES (64, 32, 2, 0.00, '2026-11-07 20:36:43.28567');
INSERT INTO public.inventory VALUES (65, 33, 1, 29.00, '2026-11-07 20:36:43.288367');
INSERT INTO public.inventory VALUES (66, 33, 2, 0.00, '2026-11-07 20:36:43.289667');
INSERT INTO public.inventory VALUES (67, 34, 1, 6.00, '2026-11-07 20:36:43.292053');
INSERT INTO public.inventory VALUES (68, 34, 2, 0.00, '2026-11-07 20:36:43.293269');
INSERT INTO public.inventory VALUES (69, 35, 1, 21.00, '2026-11-07 20:36:43.296731');
INSERT INTO public.inventory VALUES (70, 35, 2, 0.00, '2026-11-07 20:36:43.298858');
INSERT INTO public.inventory VALUES (71, 36, 1, 0.00, '2026-11-07 20:36:43.301886');
INSERT INTO public.inventory VALUES (72, 36, 2, 0.00, '2026-11-07 20:36:43.303177');
INSERT INTO public.inventory VALUES (73, 37, 1, 116.00, '2026-11-07 20:36:43.305851');
INSERT INTO public.inventory VALUES (74, 37, 2, 0.00, '2026-11-07 20:36:43.306849');
INSERT INTO public.inventory VALUES (75, 38, 1, 6.00, '2026-11-07 20:36:43.309848');
INSERT INTO public.inventory VALUES (76, 38, 2, 0.00, '2026-11-07 20:36:43.31127');
INSERT INTO public.inventory VALUES (77, 39, 1, 0.00, '2026-11-07 20:36:43.314631');
INSERT INTO public.inventory VALUES (78, 39, 2, 0.00, '2026-11-07 20:36:43.315894');
INSERT INTO public.inventory VALUES (79, 40, 1, 12.00, '2026-11-07 20:36:43.318758');
INSERT INTO public.inventory VALUES (80, 40, 2, 0.00, '2026-11-07 20:36:43.319728');
INSERT INTO public.inventory VALUES (81, 41, 1, 2841.00, '2026-11-07 20:36:43.323079');
INSERT INTO public.inventory VALUES (82, 41, 2, 0.00, '2026-11-07 20:36:43.324269');
INSERT INTO public.inventory VALUES (83, 42, 1, 38.00, '2026-11-07 20:36:43.327349');
INSERT INTO public.inventory VALUES (84, 42, 2, 0.00, '2026-11-07 20:36:43.32945');
INSERT INTO public.inventory VALUES (85, 43, 1, 10.00, '2026-11-07 20:36:43.332427');
INSERT INTO public.inventory VALUES (86, 43, 2, 0.00, '2026-11-07 20:36:43.333718');
INSERT INTO public.inventory VALUES (87, 44, 1, 9.00, '2026-11-07 20:36:43.336463');
INSERT INTO public.inventory VALUES (88, 44, 2, 0.00, '2026-11-07 20:36:43.338046');
INSERT INTO public.inventory VALUES (89, 45, 1, 0.00, '2026-11-07 20:36:43.340862');
INSERT INTO public.inventory VALUES (90, 45, 2, 0.00, '2026-11-07 20:36:43.342042');
INSERT INTO public.inventory VALUES (91, 46, 1, 0.00, '2026-11-07 20:36:43.347627');
INSERT INTO public.inventory VALUES (92, 46, 2, 0.00, '2026-11-07 20:36:43.350429');
INSERT INTO public.inventory VALUES (93, 47, 1, 0.00, '2026-11-07 20:36:43.354564');
INSERT INTO public.inventory VALUES (94, 47, 2, 0.00, '2026-11-07 20:36:43.356409');
INSERT INTO public.inventory VALUES (95, 48, 1, 27.00, '2026-11-07 20:36:43.361463');
INSERT INTO public.inventory VALUES (96, 48, 2, 0.00, '2026-11-07 20:36:43.364989');
INSERT INTO public.inventory VALUES (97, 49, 1, 35.00, '2026-11-07 20:36:43.367912');
INSERT INTO public.inventory VALUES (98, 49, 2, 0.00, '2026-11-07 20:36:43.36919');
INSERT INTO public.inventory VALUES (99, 50, 1, 20.00, '2026-11-07 20:36:43.372805');
INSERT INTO public.inventory VALUES (100, 50, 2, 0.00, '2026-11-07 20:36:43.374902');
INSERT INTO public.inventory VALUES (101, 51, 1, 21.00, '2026-11-07 20:36:43.378516');
INSERT INTO public.inventory VALUES (102, 51, 2, 0.00, '2026-11-07 20:36:43.3803');
INSERT INTO public.inventory VALUES (103, 52, 1, 0.00, '2026-11-07 20:36:43.383119');
INSERT INTO public.inventory VALUES (104, 52, 2, 0.00, '2026-11-07 20:36:43.384332');
INSERT INTO public.inventory VALUES (105, 53, 1, 0.00, '2026-11-07 20:36:43.386383');
INSERT INTO public.inventory VALUES (106, 53, 2, 0.00, '2026-11-07 20:36:43.387445');
INSERT INTO public.inventory VALUES (107, 54, 1, 0.00, '2026-11-07 20:36:43.389947');
INSERT INTO public.inventory VALUES (108, 54, 2, 0.00, '2026-11-07 20:36:43.391106');
INSERT INTO public.inventory VALUES (109, 55, 1, 30.00, '2026-11-07 20:36:43.393539');
INSERT INTO public.inventory VALUES (110, 55, 2, 0.00, '2026-11-07 20:36:43.394794');
INSERT INTO public.inventory VALUES (111, 56, 1, 16.00, '2026-11-07 20:36:43.397121');
INSERT INTO public.inventory VALUES (112, 56, 2, 0.00, '2026-11-07 20:36:43.398198');
INSERT INTO public.inventory VALUES (113, 57, 1, 9.00, '2026-11-07 20:36:43.400525');
INSERT INTO public.inventory VALUES (114, 57, 2, 0.00, '2026-11-07 20:36:43.401428');
INSERT INTO public.inventory VALUES (115, 58, 1, 0.00, '2026-11-07 20:36:43.403847');
INSERT INTO public.inventory VALUES (116, 58, 2, 0.00, '2026-11-07 20:36:43.404915');
INSERT INTO public.inventory VALUES (117, 59, 1, 0.00, '2026-11-07 20:36:43.407207');
INSERT INTO public.inventory VALUES (118, 59, 2, 0.00, '2026-11-07 20:36:43.408154');
INSERT INTO public.inventory VALUES (119, 60, 1, 0.00, '2026-11-07 20:36:43.410291');
INSERT INTO public.inventory VALUES (120, 60, 2, 0.00, '2026-11-07 20:36:43.41145');
INSERT INTO public.inventory VALUES (121, 61, 1, 0.00, '2026-11-07 20:36:43.414029');
INSERT INTO public.inventory VALUES (122, 61, 2, 0.00, '2026-11-07 20:36:43.414848');
INSERT INTO public.inventory VALUES (123, 62, 1, 0.00, '2026-11-07 20:36:43.417082');
INSERT INTO public.inventory VALUES (124, 62, 2, 0.00, '2026-11-07 20:36:43.418196');
INSERT INTO public.inventory VALUES (125, 63, 1, 12.00, '2026-11-07 20:36:43.420281');
INSERT INTO public.inventory VALUES (126, 63, 2, 0.00, '2026-11-07 20:36:43.421378');
INSERT INTO public.inventory VALUES (127, 64, 1, 3200.00, '2026-11-07 20:36:43.423488');
INSERT INTO public.inventory VALUES (128, 64, 2, 0.00, '2026-11-07 20:36:43.424452');
INSERT INTO public.inventory VALUES (129, 65, 1, 0.00, '2026-11-07 20:36:43.426045');
INSERT INTO public.inventory VALUES (130, 65, 2, 0.00, '2026-11-07 20:36:43.426685');
INSERT INTO public.inventory VALUES (131, 66, 1, 0.00, '2026-11-07 20:36:43.429068');
INSERT INTO public.inventory VALUES (132, 66, 2, 0.00, '2026-11-07 20:36:43.42987');
INSERT INTO public.inventory VALUES (133, 67, 1, 11.00, '2026-11-07 20:36:43.431242');
INSERT INTO public.inventory VALUES (134, 67, 2, 0.00, '2026-11-07 20:36:43.432046');
INSERT INTO public.inventory VALUES (135, 68, 1, 9.00, '2026-11-07 20:36:43.434339');
INSERT INTO public.inventory VALUES (136, 68, 2, 0.00, '2026-11-07 20:36:43.435334');
INSERT INTO public.inventory VALUES (137, 69, 1, 2.00, '2026-11-07 20:36:43.437357');
INSERT INTO public.inventory VALUES (138, 69, 2, 0.00, '2026-11-07 20:36:43.438495');
INSERT INTO public.inventory VALUES (139, 70, 1, 3.00, '2026-11-07 20:36:43.440586');
INSERT INTO public.inventory VALUES (140, 70, 2, 0.00, '2026-11-07 20:36:43.441563');
INSERT INTO public.inventory VALUES (141, 71, 1, 0.00, '2026-11-07 20:36:43.443633');
INSERT INTO public.inventory VALUES (142, 71, 2, 0.00, '2026-11-07 20:36:43.444877');
INSERT INTO public.inventory VALUES (143, 72, 1, 0.00, '2026-11-07 20:36:43.446867');
INSERT INTO public.inventory VALUES (144, 72, 2, 0.00, '2026-11-07 20:36:43.447909');
INSERT INTO public.inventory VALUES (145, 73, 1, 17.00, '2026-11-07 20:36:43.450115');
INSERT INTO public.inventory VALUES (146, 73, 2, 0.00, '2026-11-07 20:36:43.451052');
INSERT INTO public.inventory VALUES (147, 74, 1, 11.00, '2026-11-07 20:36:43.453248');
INSERT INTO public.inventory VALUES (148, 74, 2, 0.00, '2026-11-07 20:36:43.454428');
INSERT INTO public.inventory VALUES (149, 75, 1, 9.00, '2026-11-07 20:36:43.45708');
INSERT INTO public.inventory VALUES (150, 75, 2, 0.00, '2026-11-07 20:36:43.458149');
INSERT INTO public.inventory VALUES (151, 76, 1, 0.00, '2026-11-07 20:36:43.460761');
INSERT INTO public.inventory VALUES (152, 76, 2, 0.00, '2026-11-07 20:36:43.461723');
INSERT INTO public.inventory VALUES (153, 77, 1, 1474.00, '2026-11-07 20:36:43.463857');
INSERT INTO public.inventory VALUES (154, 77, 2, 0.00, '2026-11-07 20:36:43.465006');
INSERT INTO public.inventory VALUES (155, 78, 1, 0.00, '2026-11-07 20:36:43.467351');
INSERT INTO public.inventory VALUES (156, 78, 2, 0.00, '2026-11-07 20:36:43.468286');
INSERT INTO public.inventory VALUES (157, 79, 1, 0.00, '2026-11-07 20:36:43.470466');
INSERT INTO public.inventory VALUES (158, 79, 2, 0.00, '2026-11-07 20:36:43.47155');
INSERT INTO public.inventory VALUES (159, 80, 1, 0.00, '2026-11-07 20:36:43.473925');
INSERT INTO public.inventory VALUES (160, 80, 2, 0.00, '2026-11-07 20:36:43.474835');
INSERT INTO public.inventory VALUES (161, 81, 1, 0.00, '2026-11-07 20:36:43.477012');
INSERT INTO public.inventory VALUES (162, 81, 2, 0.00, '2026-11-07 20:36:43.478058');
INSERT INTO public.inventory VALUES (163, 82, 1, 24.00, '2026-11-07 20:36:43.479992');
INSERT INTO public.inventory VALUES (164, 82, 2, 0.00, '2026-11-07 20:36:43.480863');
INSERT INTO public.inventory VALUES (165, 83, 1, 0.00, '2026-11-07 20:36:43.48274');
INSERT INTO public.inventory VALUES (166, 83, 2, 0.00, '2026-11-07 20:36:43.483641');
INSERT INTO public.inventory VALUES (167, 84, 1, 0.00, '2026-11-07 20:36:43.485229');
INSERT INTO public.inventory VALUES (168, 84, 2, 0.00, '2026-11-07 20:36:43.485797');
INSERT INTO public.inventory VALUES (169, 85, 1, 0.00, '2026-11-07 20:36:43.487118');
INSERT INTO public.inventory VALUES (170, 85, 2, 0.00, '2026-11-07 20:36:43.487843');
INSERT INTO public.inventory VALUES (171, 86, 1, 2690.00, '2026-11-07 20:36:43.489928');
INSERT INTO public.inventory VALUES (172, 86, 2, 0.00, '2026-11-07 20:36:43.490811');
INSERT INTO public.inventory VALUES (173, 87, 1, 0.00, '2026-11-07 20:36:43.492637');
INSERT INTO public.inventory VALUES (174, 87, 2, 0.00, '2026-11-07 20:36:43.493539');
INSERT INTO public.inventory VALUES (175, 88, 1, 0.00, '2026-11-07 20:36:43.495397');
INSERT INTO public.inventory VALUES (176, 88, 2, 0.00, '2026-11-07 20:36:43.49601');
INSERT INTO public.inventory VALUES (177, 89, 1, 0.00, '2026-11-07 20:36:43.497274');
INSERT INTO public.inventory VALUES (178, 89, 2, 0.00, '2026-11-07 20:36:43.497804');
INSERT INTO public.inventory VALUES (179, 90, 1, 0.00, '2026-11-07 20:36:43.498926');
INSERT INTO public.inventory VALUES (180, 90, 2, 0.00, '2026-11-07 20:36:43.499426');
INSERT INTO public.inventory VALUES (181, 91, 1, 0.00, '2026-11-07 20:36:43.50113');
INSERT INTO public.inventory VALUES (182, 91, 2, 0.00, '2026-11-07 20:36:43.50206');
INSERT INTO public.inventory VALUES (183, 92, 1, 8.00, '2026-11-07 20:36:43.503637');
INSERT INTO public.inventory VALUES (184, 92, 2, 0.00, '2026-11-07 20:36:43.504591');
INSERT INTO public.inventory VALUES (185, 93, 1, 0.00, '2026-11-07 20:36:43.506298');
INSERT INTO public.inventory VALUES (186, 93, 2, 0.00, '2026-11-07 20:36:43.506877');
INSERT INTO public.inventory VALUES (187, 94, 1, 4.00, '2026-11-07 20:36:43.50809');
INSERT INTO public.inventory VALUES (188, 94, 2, 0.00, '2026-11-07 20:36:43.508595');
INSERT INTO public.inventory VALUES (189, 95, 1, 10.00, '2026-11-07 20:36:43.509686');
INSERT INTO public.inventory VALUES (190, 95, 2, 0.00, '2026-11-07 20:36:43.510261');
INSERT INTO public.inventory VALUES (191, 96, 1, 4.00, '2026-11-07 20:36:43.511394');
INSERT INTO public.inventory VALUES (192, 96, 2, 0.00, '2026-11-07 20:36:43.511851');
INSERT INTO public.inventory VALUES (193, 97, 1, 0.00, '2026-11-07 20:36:43.513013');
INSERT INTO public.inventory VALUES (194, 97, 2, 0.00, '2026-11-07 20:36:43.513471');
INSERT INTO public.inventory VALUES (195, 98, 1, 0.00, '2026-11-07 20:36:43.514526');
INSERT INTO public.inventory VALUES (196, 98, 2, 0.00, '2026-11-07 20:36:43.515');
INSERT INTO public.inventory VALUES (197, 99, 1, 45.00, '2026-11-07 20:36:43.51664');
INSERT INTO public.inventory VALUES (198, 99, 2, 0.00, '2026-11-07 20:36:43.517254');
INSERT INTO public.inventory VALUES (199, 100, 1, 77.00, '2026-11-07 20:36:43.518344');
INSERT INTO public.inventory VALUES (200, 100, 2, 0.00, '2026-11-07 20:36:43.518818');
INSERT INTO public.inventory VALUES (201, 101, 1, 12.00, '2026-11-07 20:36:43.51988');
INSERT INTO public.inventory VALUES (202, 101, 2, 0.00, '2026-11-07 20:36:43.520903');
INSERT INTO public.inventory VALUES (203, 102, 1, 40.00, '2026-11-07 20:36:43.522772');
INSERT INTO public.inventory VALUES (204, 102, 2, 0.00, '2026-11-07 20:36:43.523611');
INSERT INTO public.inventory VALUES (205, 103, 1, 19.00, '2026-11-07 20:36:43.525367');
INSERT INTO public.inventory VALUES (206, 103, 2, 0.00, '2026-11-07 20:36:43.526203');
INSERT INTO public.inventory VALUES (207, 104, 1, 0.00, '2026-11-07 20:36:43.529166');
INSERT INTO public.inventory VALUES (208, 104, 2, 0.00, '2026-11-07 20:36:43.530161');
INSERT INTO public.inventory VALUES (209, 105, 1, 0.00, '2026-11-07 20:36:43.531787');
INSERT INTO public.inventory VALUES (210, 105, 2, 0.00, '2026-11-07 20:36:43.5324');
INSERT INTO public.inventory VALUES (211, 106, 1, 288.00, '2026-11-07 20:36:43.533626');
INSERT INTO public.inventory VALUES (212, 106, 2, 0.00, '2026-11-07 20:36:43.534138');
INSERT INTO public.inventory VALUES (213, 107, 1, 0.00, '2026-11-07 20:36:43.535248');
INSERT INTO public.inventory VALUES (214, 107, 2, 0.00, '2026-11-07 20:36:43.535718');
INSERT INTO public.inventory VALUES (215, 108, 1, 15.00, '2026-11-07 20:36:43.537035');
INSERT INTO public.inventory VALUES (216, 108, 2, 0.00, '2026-11-07 20:36:43.537749');
INSERT INTO public.inventory VALUES (217, 109, 1, 11.00, '2026-11-07 20:36:43.538988');
INSERT INTO public.inventory VALUES (218, 109, 2, 0.00, '2026-11-07 20:36:43.53947');
INSERT INTO public.inventory VALUES (219, 110, 1, 24.00, '2026-11-07 20:36:43.540867');
INSERT INTO public.inventory VALUES (220, 110, 2, 0.00, '2026-11-07 20:36:43.541839');
INSERT INTO public.inventory VALUES (221, 111, 1, 743.00, '2026-11-07 20:36:43.543894');
INSERT INTO public.inventory VALUES (222, 111, 2, 0.00, '2026-11-07 20:36:43.544828');
INSERT INTO public.inventory VALUES (223, 112, 1, 0.00, '2026-11-07 20:36:43.546425');
INSERT INTO public.inventory VALUES (224, 112, 2, 0.00, '2026-11-07 20:36:43.547045');
INSERT INTO public.inventory VALUES (225, 113, 1, 6.00, '2026-11-07 20:36:43.549043');
INSERT INTO public.inventory VALUES (226, 113, 2, 0.00, '2026-11-07 20:36:43.549789');
INSERT INTO public.inventory VALUES (227, 114, 1, 16.00, '2026-11-07 20:36:43.551081');
INSERT INTO public.inventory VALUES (228, 114, 2, 0.00, '2026-11-07 20:36:43.551586');
INSERT INTO public.inventory VALUES (229, 115, 1, 6.00, '2026-11-07 20:36:43.553352');
INSERT INTO public.inventory VALUES (230, 115, 2, 0.00, '2026-11-07 20:36:43.554549');
INSERT INTO public.inventory VALUES (231, 116, 1, 0.00, '2026-11-07 20:36:43.556495');
INSERT INTO public.inventory VALUES (232, 116, 2, 0.00, '2026-11-07 20:36:43.557125');
INSERT INTO public.inventory VALUES (233, 117, 1, 8.00, '2026-11-07 20:36:43.558322');
INSERT INTO public.inventory VALUES (234, 117, 2, 0.00, '2026-11-07 20:36:43.5588');
INSERT INTO public.inventory VALUES (235, 118, 1, 0.00, '2026-11-07 20:36:43.559902');
INSERT INTO public.inventory VALUES (236, 118, 2, 0.00, '2026-11-07 20:36:43.561134');
INSERT INTO public.inventory VALUES (237, 119, 1, 0.00, '2026-11-07 20:36:43.56298');
INSERT INTO public.inventory VALUES (238, 119, 2, 0.00, '2026-11-07 20:36:43.563806');
INSERT INTO public.inventory VALUES (239, 120, 1, 0.00, '2026-11-07 20:36:43.565277');
INSERT INTO public.inventory VALUES (240, 120, 2, 0.00, '2026-11-07 20:36:43.566198');
INSERT INTO public.inventory VALUES (241, 121, 1, 28.00, '2026-11-07 20:36:43.56817');
INSERT INTO public.inventory VALUES (242, 121, 2, 0.00, '2026-11-07 20:36:43.568881');
INSERT INTO public.inventory VALUES (243, 122, 1, 0.00, '2026-11-07 20:36:43.570142');
INSERT INTO public.inventory VALUES (244, 122, 2, 0.00, '2026-11-07 20:36:43.570651');
INSERT INTO public.inventory VALUES (245, 123, 1, 74.00, '2026-11-07 20:36:43.571794');
INSERT INTO public.inventory VALUES (246, 123, 2, 0.00, '2026-11-07 20:36:43.572286');
INSERT INTO public.inventory VALUES (247, 124, 1, 160.00, '2026-11-07 20:36:43.573949');
INSERT INTO public.inventory VALUES (248, 124, 2, 0.00, '2026-11-07 20:36:43.574708');
INSERT INTO public.inventory VALUES (249, 125, 1, 0.00, '2026-11-07 20:36:43.575997');
INSERT INTO public.inventory VALUES (250, 125, 2, 0.00, '2026-11-07 20:36:43.576554');
INSERT INTO public.inventory VALUES (251, 126, 1, 0.00, '2026-11-07 20:36:43.578952');
INSERT INTO public.inventory VALUES (252, 126, 2, 0.00, '2026-11-07 20:36:43.579921');
INSERT INTO public.inventory VALUES (253, 127, 1, 9512.00, '2026-11-07 20:36:43.581672');
INSERT INTO public.inventory VALUES (254, 127, 2, 0.00, '2026-11-07 20:36:43.58242');
INSERT INTO public.inventory VALUES (255, 128, 1, 0.00, '2026-11-07 20:36:43.584097');
INSERT INTO public.inventory VALUES (256, 128, 2, 0.00, '2026-11-07 20:36:43.585034');
INSERT INTO public.inventory VALUES (257, 129, 1, 0.00, '2026-11-07 20:36:43.58677');
INSERT INTO public.inventory VALUES (258, 129, 2, 0.00, '2026-11-07 20:36:43.587309');
INSERT INTO public.inventory VALUES (259, 130, 1, 5.00, '2026-11-07 20:36:43.58849');
INSERT INTO public.inventory VALUES (260, 130, 2, 0.00, '2026-11-07 20:36:43.589036');
INSERT INTO public.inventory VALUES (261, 131, 1, 5.00, '2026-11-07 20:36:43.590131');
INSERT INTO public.inventory VALUES (262, 131, 2, 0.00, '2026-11-07 20:36:43.590591');
INSERT INTO public.inventory VALUES (263, 132, 1, 0.00, '2026-11-07 20:36:43.591617');
INSERT INTO public.inventory VALUES (264, 132, 2, 0.00, '2026-11-07 20:36:43.592055');
INSERT INTO public.inventory VALUES (265, 133, 1, 0.00, '2026-11-07 20:36:43.59329');
INSERT INTO public.inventory VALUES (266, 133, 2, 0.00, '2026-11-07 20:36:43.594456');
INSERT INTO public.inventory VALUES (267, 134, 1, 1.00, '2026-11-07 20:36:43.596156');
INSERT INTO public.inventory VALUES (268, 134, 2, 0.00, '2026-11-07 20:36:43.59671');
INSERT INTO public.inventory VALUES (269, 135, 1, 20.00, '2026-11-07 20:36:43.597843');
INSERT INTO public.inventory VALUES (270, 135, 2, 0.00, '2026-11-07 20:36:43.598313');
INSERT INTO public.inventory VALUES (271, 136, 1, 18.00, '2026-11-07 20:36:43.599363');
INSERT INTO public.inventory VALUES (272, 136, 2, 0.00, '2026-11-07 20:36:43.599805');
INSERT INTO public.inventory VALUES (273, 137, 1, 180.00, '2026-11-07 20:36:43.60084');
INSERT INTO public.inventory VALUES (274, 137, 2, 0.00, '2026-11-07 20:36:43.601297');
INSERT INTO public.inventory VALUES (275, 138, 1, 8576.00, '2026-11-07 20:36:43.602291');
INSERT INTO public.inventory VALUES (276, 138, 2, 0.00, '2026-11-07 20:36:43.602723');
INSERT INTO public.inventory VALUES (277, 139, 1, 8011.00, '2026-11-07 20:36:43.604304');
INSERT INTO public.inventory VALUES (278, 139, 2, 0.00, '2026-11-07 20:36:43.605262');
INSERT INTO public.inventory VALUES (279, 140, 1, 1388.00, '2026-11-07 20:36:43.607204');
INSERT INTO public.inventory VALUES (280, 140, 2, 0.00, '2026-11-07 20:36:43.608102');
INSERT INTO public.inventory VALUES (281, 141, 1, 5.00, '2026-11-07 20:36:43.609463');
INSERT INTO public.inventory VALUES (282, 141, 2, 0.00, '2026-11-07 20:36:43.610178');
INSERT INTO public.inventory VALUES (283, 142, 1, 46.00, '2026-11-07 20:36:43.612139');
INSERT INTO public.inventory VALUES (284, 142, 2, 0.00, '2026-11-07 20:36:43.612926');
INSERT INTO public.inventory VALUES (285, 143, 1, 2.00, '2026-11-07 20:36:43.61429');
INSERT INTO public.inventory VALUES (286, 143, 2, 0.00, '2026-11-07 20:36:43.615268');
INSERT INTO public.inventory VALUES (287, 144, 1, 34.00, '2026-11-07 20:36:43.61698');
INSERT INTO public.inventory VALUES (288, 144, 2, 0.00, '2026-11-07 20:36:43.617715');
INSERT INTO public.inventory VALUES (289, 145, 1, 0.00, '2026-11-07 20:36:43.620006');
INSERT INTO public.inventory VALUES (290, 145, 2, 0.00, '2026-11-07 20:36:43.62101');
INSERT INTO public.inventory VALUES (291, 146, 1, 12.00, '2026-11-07 20:36:43.623035');
INSERT INTO public.inventory VALUES (292, 146, 2, 0.00, '2026-11-07 20:36:43.623961');
INSERT INTO public.inventory VALUES (293, 147, 1, 0.00, '2026-11-07 20:36:43.625814');
INSERT INTO public.inventory VALUES (294, 147, 2, 0.00, '2026-11-07 20:36:43.627752');
INSERT INTO public.inventory VALUES (295, 148, 1, 183.00, '2026-11-07 20:36:43.630433');
INSERT INTO public.inventory VALUES (296, 148, 2, 0.00, '2026-11-07 20:36:43.631786');
INSERT INTO public.inventory VALUES (297, 149, 1, 18.00, '2026-11-07 20:36:43.633988');
INSERT INTO public.inventory VALUES (298, 149, 2, 0.00, '2026-11-07 20:36:43.634993');
INSERT INTO public.inventory VALUES (299, 150, 1, 20.00, '2026-11-07 20:36:43.637405');
INSERT INTO public.inventory VALUES (300, 150, 2, 0.00, '2026-11-07 20:36:43.638608');
INSERT INTO public.inventory VALUES (301, 151, 1, 208.00, '2026-11-07 20:36:43.641502');
INSERT INTO public.inventory VALUES (302, 151, 2, 0.00, '2026-11-07 20:36:43.642642');
INSERT INTO public.inventory VALUES (303, 152, 1, 133.00, '2026-11-07 20:36:43.645923');
INSERT INTO public.inventory VALUES (304, 152, 2, 0.00, '2026-11-07 20:36:43.646969');
INSERT INTO public.inventory VALUES (305, 153, 1, 2874.00, '2026-11-07 20:36:43.649756');
INSERT INTO public.inventory VALUES (306, 153, 2, 0.00, '2026-11-07 20:36:43.6508');
INSERT INTO public.inventory VALUES (307, 154, 1, 80.00, '2026-11-07 20:36:43.653486');
INSERT INTO public.inventory VALUES (308, 154, 2, 0.00, '2026-11-07 20:36:43.654722');
INSERT INTO public.inventory VALUES (309, 155, 1, 150.00, '2026-11-07 20:36:43.656962');
INSERT INTO public.inventory VALUES (310, 155, 2, 0.00, '2026-11-07 20:36:43.658024');
INSERT INTO public.inventory VALUES (311, 156, 1, 0.00, '2026-11-07 20:36:43.661467');
INSERT INTO public.inventory VALUES (312, 156, 2, 24.00, '2026-11-07 20:36:43.66258');
INSERT INTO public.inventory VALUES (313, 157, 1, 0.00, '2026-11-07 20:36:43.665197');
INSERT INTO public.inventory VALUES (314, 157, 2, 0.00, '2026-11-07 20:36:43.666267');
INSERT INTO public.inventory VALUES (315, 158, 1, 0.00, '2026-11-07 20:36:43.668741');
INSERT INTO public.inventory VALUES (316, 158, 2, 0.00, '2026-11-07 20:36:43.669831');
INSERT INTO public.inventory VALUES (317, 159, 1, 0.00, '2026-11-07 20:36:43.673226');
INSERT INTO public.inventory VALUES (318, 159, 2, 0.00, '2026-11-07 20:36:43.67508');
INSERT INTO public.inventory VALUES (319, 160, 1, 45.00, '2026-11-07 20:36:43.679332');
INSERT INTO public.inventory VALUES (320, 160, 2, 0.00, '2026-11-07 20:36:43.681442');
INSERT INTO public.inventory VALUES (321, 161, 1, 0.00, '2026-11-07 20:36:43.684924');
INSERT INTO public.inventory VALUES (322, 161, 2, 0.00, '2026-11-07 20:36:43.686427');
INSERT INTO public.inventory VALUES (323, 162, 1, 468.00, '2026-11-07 20:36:43.689077');
INSERT INTO public.inventory VALUES (324, 162, 2, 0.00, '2026-11-07 20:36:43.690306');
INSERT INTO public.inventory VALUES (325, 163, 1, 157.00, '2026-11-07 20:36:43.69347');
INSERT INTO public.inventory VALUES (326, 163, 2, 0.00, '2026-11-07 20:36:43.695289');
INSERT INTO public.inventory VALUES (327, 164, 1, 83.00, '2026-11-07 20:36:43.697561');
INSERT INTO public.inventory VALUES (328, 164, 2, 0.00, '2026-11-07 20:36:43.698549');
INSERT INTO public.inventory VALUES (329, 165, 1, 67.00, '2026-11-07 20:36:43.700524');
INSERT INTO public.inventory VALUES (330, 165, 2, 0.00, '2026-11-07 20:36:43.701389');
INSERT INTO public.inventory VALUES (331, 166, 1, 48.00, '2026-11-07 20:36:43.703948');
INSERT INTO public.inventory VALUES (332, 166, 2, 0.00, '2026-11-07 20:36:43.704948');
INSERT INTO public.inventory VALUES (333, 167, 1, 0.00, '2026-11-07 20:36:43.70744');
INSERT INTO public.inventory VALUES (334, 167, 2, 0.00, '2026-11-07 20:36:43.708225');
INSERT INTO public.inventory VALUES (335, 168, 1, 0.00, '2026-11-07 20:36:43.710328');
INSERT INTO public.inventory VALUES (336, 168, 2, 0.00, '2026-11-07 20:36:43.711885');
INSERT INTO public.inventory VALUES (337, 169, 1, 2.00, '2026-11-07 20:36:43.714237');
INSERT INTO public.inventory VALUES (338, 169, 2, 0.00, '2026-11-07 20:36:43.714988');
INSERT INTO public.inventory VALUES (339, 170, 1, 0.00, '2026-11-07 20:36:43.716778');
INSERT INTO public.inventory VALUES (340, 170, 2, 0.00, '2026-11-07 20:36:43.717833');
INSERT INTO public.inventory VALUES (341, 171, 1, 0.00, '2026-11-07 20:36:43.719869');
INSERT INTO public.inventory VALUES (342, 171, 2, 0.00, '2026-11-07 20:36:43.72061');
INSERT INTO public.inventory VALUES (343, 172, 1, 19.00, '2026-11-07 20:36:43.722404');
INSERT INTO public.inventory VALUES (344, 172, 2, 0.00, '2026-11-07 20:36:43.723051');
INSERT INTO public.inventory VALUES (345, 173, 1, 0.00, '2026-11-07 20:36:43.724921');
INSERT INTO public.inventory VALUES (346, 173, 2, 0.00, '2026-11-07 20:36:43.726119');
INSERT INTO public.inventory VALUES (347, 174, 1, 0.00, '2026-11-07 20:36:43.728797');
INSERT INTO public.inventory VALUES (348, 174, 2, 0.00, '2026-11-07 20:36:43.729703');
INSERT INTO public.inventory VALUES (349, 175, 1, 0.00, '2026-11-07 20:36:43.731664');
INSERT INTO public.inventory VALUES (350, 175, 2, 0.00, '2026-11-07 20:36:43.732342');
INSERT INTO public.inventory VALUES (351, 176, 1, 7850.00, '2026-11-07 20:36:43.73434');
INSERT INTO public.inventory VALUES (352, 176, 2, 0.00, '2026-11-07 20:36:43.735186');
INSERT INTO public.inventory VALUES (353, 177, 1, 0.00, '2026-11-07 20:36:43.736896');
INSERT INTO public.inventory VALUES (354, 177, 2, 0.00, '2026-11-07 20:36:43.737696');
INSERT INTO public.inventory VALUES (355, 178, 1, 0.00, '2026-11-07 20:36:43.739364');
INSERT INTO public.inventory VALUES (356, 178, 2, 0.00, '2026-11-07 20:36:43.740269');
INSERT INTO public.inventory VALUES (357, 179, 1, 0.00, '2026-11-07 20:36:43.742355');
INSERT INTO public.inventory VALUES (358, 179, 2, 0.00, '2026-11-07 20:36:43.743223');
INSERT INTO public.inventory VALUES (359, 180, 1, 6.00, '2026-11-07 20:36:43.745453');
INSERT INTO public.inventory VALUES (360, 180, 2, 0.00, '2026-11-07 20:36:43.746546');
INSERT INTO public.inventory VALUES (361, 181, 1, 1.00, '2026-11-07 20:36:43.748574');
INSERT INTO public.inventory VALUES (362, 181, 2, 0.00, '2026-11-07 20:36:43.749396');
INSERT INTO public.inventory VALUES (363, 182, 1, 0.00, '2026-11-07 20:36:43.75134');
INSERT INTO public.inventory VALUES (364, 182, 2, 0.00, '2026-11-07 20:36:43.752081');
INSERT INTO public.inventory VALUES (365, 183, 1, 0.00, '2026-11-07 20:36:43.753457');
INSERT INTO public.inventory VALUES (366, 183, 2, 0.00, '2026-11-07 20:36:43.754051');
INSERT INTO public.inventory VALUES (367, 184, 1, 0.00, '2026-11-07 20:36:43.755778');
INSERT INTO public.inventory VALUES (368, 184, 2, 0.00, '2026-11-07 20:36:43.756779');
INSERT INTO public.inventory VALUES (369, 185, 1, 10.00, '2026-11-07 20:36:43.758856');
INSERT INTO public.inventory VALUES (370, 185, 2, 0.00, '2026-11-07 20:36:43.759512');
INSERT INTO public.inventory VALUES (371, 186, 1, 10.00, '2026-11-07 20:36:43.761447');
INSERT INTO public.inventory VALUES (372, 186, 2, 0.00, '2026-11-07 20:36:43.762041');
INSERT INTO public.inventory VALUES (373, 187, 1, 0.00, '2026-11-07 20:36:43.763574');
INSERT INTO public.inventory VALUES (374, 187, 2, 0.00, '2026-11-07 20:36:43.76435');
INSERT INTO public.inventory VALUES (375, 188, 1, 79.00, '2026-11-07 20:36:43.766414');
INSERT INTO public.inventory VALUES (376, 188, 2, 0.00, '2026-11-07 20:36:43.767449');
INSERT INTO public.inventory VALUES (377, 189, 1, 0.00, '2026-11-07 20:36:43.769305');
INSERT INTO public.inventory VALUES (378, 189, 2, 0.00, '2026-11-07 20:36:43.770023');
INSERT INTO public.inventory VALUES (379, 190, 1, 36.00, '2026-11-07 20:36:43.77142');
INSERT INTO public.inventory VALUES (380, 190, 2, 0.00, '2026-11-07 20:36:43.77212');
INSERT INTO public.inventory VALUES (381, 191, 1, 77.00, '2026-11-07 20:36:43.773796');
INSERT INTO public.inventory VALUES (382, 191, 2, 0.00, '2026-11-07 20:36:43.774714');
INSERT INTO public.inventory VALUES (383, 192, 1, 0.00, '2026-11-07 20:36:43.776286');
INSERT INTO public.inventory VALUES (384, 192, 2, 1.00, '2026-11-07 20:36:43.777071');
INSERT INTO public.inventory VALUES (385, 193, 1, 0.00, '2026-11-07 20:36:43.778954');
INSERT INTO public.inventory VALUES (386, 193, 2, 4.00, '2026-11-07 20:36:43.77954');
INSERT INTO public.inventory VALUES (387, 194, 1, 0.00, '2026-11-07 20:36:43.780769');
INSERT INTO public.inventory VALUES (388, 194, 2, 9.00, '2026-11-07 20:36:43.7817');
INSERT INTO public.inventory VALUES (389, 195, 1, 0.00, '2026-11-07 20:36:43.783765');
INSERT INTO public.inventory VALUES (390, 195, 2, 0.00, '2026-11-07 20:36:43.784638');
INSERT INTO public.inventory VALUES (391, 196, 1, 0.00, '2026-11-07 20:36:43.786456');
INSERT INTO public.inventory VALUES (392, 196, 2, 0.00, '2026-11-07 20:36:43.787183');
INSERT INTO public.inventory VALUES (393, 197, 1, 0.00, '2026-11-07 20:36:43.78872');
INSERT INTO public.inventory VALUES (394, 197, 2, 1.00, '2026-11-07 20:36:43.789267');
INSERT INTO public.inventory VALUES (395, 198, 1, 0.00, '2026-11-07 20:36:43.790914');
INSERT INTO public.inventory VALUES (396, 198, 2, 1.00, '2026-11-07 20:36:43.791596');
INSERT INTO public.inventory VALUES (397, 199, 1, 0.00, '2026-11-07 20:36:43.793006');
INSERT INTO public.inventory VALUES (398, 199, 2, 3.00, '2026-11-07 20:36:43.794038');
INSERT INTO public.inventory VALUES (399, 200, 1, 0.00, '2026-11-07 20:36:43.795825');
INSERT INTO public.inventory VALUES (400, 200, 2, 0.00, '2026-11-07 20:36:43.796426');
INSERT INTO public.inventory VALUES (401, 201, 1, 0.00, '2026-11-07 20:36:43.797625');
INSERT INTO public.inventory VALUES (402, 201, 2, 2.00, '2026-11-07 20:36:43.798585');
INSERT INTO public.inventory VALUES (403, 202, 1, 0.00, '2026-11-07 20:36:43.801542');
INSERT INTO public.inventory VALUES (404, 202, 2, 0.00, '2026-11-07 20:36:43.802381');
INSERT INTO public.inventory VALUES (405, 203, 1, 0.00, '2026-11-07 20:36:43.804589');
INSERT INTO public.inventory VALUES (406, 203, 2, 4.00, '2026-11-07 20:36:43.805462');
INSERT INTO public.inventory VALUES (407, 204, 1, 0.00, '2026-11-07 20:36:43.807438');
INSERT INTO public.inventory VALUES (408, 204, 2, 23.00, '2026-11-07 20:36:43.808416');
INSERT INTO public.inventory VALUES (409, 205, 1, 0.00, '2026-11-07 20:36:43.810177');
INSERT INTO public.inventory VALUES (410, 205, 2, 32.00, '2026-11-07 20:36:43.811183');
INSERT INTO public.inventory VALUES (411, 206, 1, 0.00, '2026-11-07 20:36:43.812964');
INSERT INTO public.inventory VALUES (412, 206, 2, 75.00, '2026-11-07 20:36:43.813633');
INSERT INTO public.inventory VALUES (413, 207, 1, 0.00, '2026-11-07 20:36:43.815761');
INSERT INTO public.inventory VALUES (414, 207, 2, 0.00, '2026-11-07 20:36:43.81697');
INSERT INTO public.inventory VALUES (415, 208, 1, 0.00, '2026-11-07 20:36:43.818915');
INSERT INTO public.inventory VALUES (416, 208, 2, 0.00, '2026-11-07 20:36:43.819741');
INSERT INTO public.inventory VALUES (417, 209, 1, 0.00, '2026-11-07 20:36:43.821133');
INSERT INTO public.inventory VALUES (418, 209, 2, 1.00, '2026-11-07 20:36:43.821639');
INSERT INTO public.inventory VALUES (419, 210, 1, 0.00, '2026-11-07 20:36:43.823383');
INSERT INTO public.inventory VALUES (420, 210, 2, 0.00, '2026-11-07 20:36:43.824377');
INSERT INTO public.inventory VALUES (421, 211, 1, 0.00, '2026-11-07 20:36:43.826296');
INSERT INTO public.inventory VALUES (422, 211, 2, 0.00, '2026-11-07 20:36:43.827473');
INSERT INTO public.inventory VALUES (423, 212, 1, 0.00, '2026-11-07 20:36:43.829858');
INSERT INTO public.inventory VALUES (424, 212, 2, 27.00, '2026-11-07 20:36:43.830596');
INSERT INTO public.inventory VALUES (425, 213, 1, 0.00, '2026-11-07 20:36:43.832454');
INSERT INTO public.inventory VALUES (426, 213, 2, 7.00, '2026-11-07 20:36:43.833418');
INSERT INTO public.inventory VALUES (427, 214, 1, 0.00, '2026-11-07 20:36:43.835112');
INSERT INTO public.inventory VALUES (428, 214, 2, 3.00, '2026-11-07 20:36:43.835879');
INSERT INTO public.inventory VALUES (429, 215, 1, 0.00, '2026-11-07 20:36:43.837231');
INSERT INTO public.inventory VALUES (430, 215, 2, 0.00, '2026-11-07 20:36:43.837735');
INSERT INTO public.inventory VALUES (431, 216, 1, 0.00, '2026-11-07 20:36:43.83881');
INSERT INTO public.inventory VALUES (432, 216, 2, 0.00, '2026-11-07 20:36:43.839249');
INSERT INTO public.inventory VALUES (433, 217, 1, 0.00, '2026-11-07 20:36:43.840979');
INSERT INTO public.inventory VALUES (434, 217, 2, 8.00, '2026-11-07 20:36:43.842054');
INSERT INTO public.inventory VALUES (435, 218, 1, 0.00, '2026-11-07 20:36:43.843917');
INSERT INTO public.inventory VALUES (436, 218, 2, 3.00, '2026-11-07 20:36:43.844808');
INSERT INTO public.inventory VALUES (437, 219, 1, 0.00, '2026-11-07 20:36:43.846133');
INSERT INTO public.inventory VALUES (438, 219, 2, 0.00, '2026-11-07 20:36:43.846616');
INSERT INTO public.inventory VALUES (439, 220, 1, 0.00, '2026-11-07 20:36:43.848951');
INSERT INTO public.inventory VALUES (440, 220, 2, 0.00, '2026-11-07 20:36:43.84982');
INSERT INTO public.inventory VALUES (441, 221, 1, 0.00, '2026-11-07 20:36:43.851567');
INSERT INTO public.inventory VALUES (442, 221, 2, 0.00, '2026-11-07 20:36:43.85232');
INSERT INTO public.inventory VALUES (443, 222, 1, 0.00, '2026-11-07 20:36:43.853984');
INSERT INTO public.inventory VALUES (444, 222, 2, 4.00, '2026-11-07 20:36:43.854856');
INSERT INTO public.inventory VALUES (445, 223, 1, 0.00, '2026-11-07 20:36:43.856626');
INSERT INTO public.inventory VALUES (446, 223, 2, 0.00, '2026-11-07 20:36:43.857379');
INSERT INTO public.inventory VALUES (447, 224, 1, 0.00, '2026-11-07 20:36:43.859117');
INSERT INTO public.inventory VALUES (448, 224, 2, 0.00, '2026-11-07 20:36:43.859986');
INSERT INTO public.inventory VALUES (449, 225, 1, 0.00, '2026-11-07 20:36:43.862051');
INSERT INTO public.inventory VALUES (450, 225, 2, 0.00, '2026-11-07 20:36:43.862815');
INSERT INTO public.inventory VALUES (451, 226, 1, 0.00, '2026-11-07 20:36:43.864753');
INSERT INTO public.inventory VALUES (452, 226, 2, 1.00, '2026-11-07 20:36:43.865504');
INSERT INTO public.inventory VALUES (453, 227, 1, 0.00, '2026-11-07 20:36:43.866899');
INSERT INTO public.inventory VALUES (454, 227, 2, 0.00, '2026-11-07 20:36:43.867477');
INSERT INTO public.inventory VALUES (455, 228, 1, 0.00, '2026-11-07 20:36:43.868725');
INSERT INTO public.inventory VALUES (456, 228, 2, 2.00, '2026-11-07 20:36:43.869261');
INSERT INTO public.inventory VALUES (457, 229, 1, 0.00, '2026-11-07 20:36:43.870417');
INSERT INTO public.inventory VALUES (458, 229, 2, 1.00, '2026-11-07 20:36:43.8709');
INSERT INTO public.inventory VALUES (459, 230, 1, 0.00, '2026-11-07 20:36:43.872002');
INSERT INTO public.inventory VALUES (460, 230, 2, 17.00, '2026-11-07 20:36:43.872481');
INSERT INTO public.inventory VALUES (461, 231, 1, 0.00, '2026-11-07 20:36:43.873634');
INSERT INTO public.inventory VALUES (462, 231, 2, 0.00, '2026-11-07 20:36:43.874126');
INSERT INTO public.inventory VALUES (463, 232, 1, 0.00, '2026-11-07 20:36:43.875192');
INSERT INTO public.inventory VALUES (464, 232, 2, 0.00, '2026-11-07 20:36:43.875657');
INSERT INTO public.inventory VALUES (465, 233, 1, 0.00, '2026-11-07 20:36:43.87706');
INSERT INTO public.inventory VALUES (466, 233, 2, 0.00, '2026-11-07 20:36:43.877885');
INSERT INTO public.inventory VALUES (467, 234, 1, 0.00, '2026-11-07 20:36:43.879236');
INSERT INTO public.inventory VALUES (468, 234, 2, 0.00, '2026-11-07 20:36:43.87976');
INSERT INTO public.inventory VALUES (469, 235, 1, 0.00, '2026-11-07 20:36:43.880919');
INSERT INTO public.inventory VALUES (470, 235, 2, 0.00, '2026-11-07 20:36:43.881443');
INSERT INTO public.inventory VALUES (471, 236, 1, 0.00, '2026-11-07 20:36:43.882539');
INSERT INTO public.inventory VALUES (472, 236, 2, 0.00, '2026-11-07 20:36:43.883017');
INSERT INTO public.inventory VALUES (473, 237, 1, 0.00, '2026-11-07 20:36:43.884081');
INSERT INTO public.inventory VALUES (474, 237, 2, 0.00, '2026-11-07 20:36:43.884547');
INSERT INTO public.inventory VALUES (475, 238, 1, 0.00, '2026-11-07 20:36:43.885971');
INSERT INTO public.inventory VALUES (476, 238, 2, 4.00, '2026-11-07 20:36:43.88746');
INSERT INTO public.inventory VALUES (477, 239, 1, 0.00, '2026-11-07 20:36:43.890054');
INSERT INTO public.inventory VALUES (478, 239, 2, 0.00, '2026-11-07 20:36:43.890889');
INSERT INTO public.inventory VALUES (479, 240, 1, 0.00, '2026-11-07 20:36:43.892247');
INSERT INTO public.inventory VALUES (480, 240, 2, 0.00, '2026-11-07 20:36:43.892774');
INSERT INTO public.inventory VALUES (481, 241, 1, 0.00, '2026-11-07 20:36:43.894384');
INSERT INTO public.inventory VALUES (482, 241, 2, 0.00, '2026-11-07 20:36:43.895093');
INSERT INTO public.inventory VALUES (483, 242, 1, 0.00, '2026-11-07 20:36:43.896325');
INSERT INTO public.inventory VALUES (484, 242, 2, 0.00, '2026-11-07 20:36:43.89679');
INSERT INTO public.inventory VALUES (485, 243, 1, 0.00, '2026-11-07 20:36:43.897828');
INSERT INTO public.inventory VALUES (486, 243, 2, 24.00, '2026-11-07 20:36:43.898282');
INSERT INTO public.inventory VALUES (487, 244, 1, 0.00, '2026-11-07 20:36:43.89925');
INSERT INTO public.inventory VALUES (488, 244, 2, 1.00, '2026-11-07 20:36:43.899688');
INSERT INTO public.inventory VALUES (489, 245, 1, 0.00, '2026-11-07 20:36:43.900747');
INSERT INTO public.inventory VALUES (490, 245, 2, 61.00, '2026-11-07 20:36:43.90117');
INSERT INTO public.inventory VALUES (491, 246, 1, 0.00, '2026-11-07 20:36:43.902766');
INSERT INTO public.inventory VALUES (492, 246, 2, 3.00, '2026-11-07 20:36:43.903509');
INSERT INTO public.inventory VALUES (493, 247, 1, 0.00, '2026-11-07 20:36:43.904791');
INSERT INTO public.inventory VALUES (494, 247, 2, 0.00, '2026-11-07 20:36:43.905307');
INSERT INTO public.inventory VALUES (495, 248, 1, 0.00, '2026-11-07 20:36:43.906391');
INSERT INTO public.inventory VALUES (496, 248, 2, 21.00, '2026-11-07 20:36:43.906852');
INSERT INTO public.inventory VALUES (497, 249, 1, 0.00, '2026-11-07 20:36:43.907912');
INSERT INTO public.inventory VALUES (498, 249, 2, 8.00, '2026-11-07 20:36:43.908369');
INSERT INTO public.inventory VALUES (499, 250, 1, 0.00, '2026-11-07 20:36:43.909382');
INSERT INTO public.inventory VALUES (500, 250, 2, 15.00, '2026-11-07 20:36:43.909844');
INSERT INTO public.inventory VALUES (501, 251, 1, 0.00, '2026-11-07 20:36:43.911597');
INSERT INTO public.inventory VALUES (502, 251, 2, 0.00, '2026-11-07 20:36:43.912173');
INSERT INTO public.inventory VALUES (503, 252, 1, 0.00, '2026-11-07 20:36:43.913642');
INSERT INTO public.inventory VALUES (504, 252, 2, 15.00, '2026-11-07 20:36:43.914132');
INSERT INTO public.inventory VALUES (505, 253, 1, 0.00, '2026-11-07 20:36:43.91524');
INSERT INTO public.inventory VALUES (506, 253, 2, 32.00, '2026-11-07 20:36:43.915685');
INSERT INTO public.inventory VALUES (507, 254, 1, 0.00, '2026-11-07 20:36:43.916672');
INSERT INTO public.inventory VALUES (508, 254, 2, 33.00, '2026-11-07 20:36:43.917102');
INSERT INTO public.inventory VALUES (509, 255, 1, 0.00, '2026-11-07 20:36:43.918056');
INSERT INTO public.inventory VALUES (510, 255, 2, 0.00, '2026-11-07 20:36:43.918465');
INSERT INTO public.inventory VALUES (511, 256, 1, 0.00, '2026-11-07 20:36:43.919746');
INSERT INTO public.inventory VALUES (512, 256, 2, 2.00, '2026-11-07 20:36:43.920525');
INSERT INTO public.inventory VALUES (513, 257, 1, 0.00, '2026-11-07 20:36:43.922271');
INSERT INTO public.inventory VALUES (514, 257, 2, 8.00, '2026-11-07 20:36:43.923038');
INSERT INTO public.inventory VALUES (515, 258, 1, 0.00, '2026-11-07 20:36:43.924586');
INSERT INTO public.inventory VALUES (516, 258, 2, 3.00, '2026-11-07 20:36:43.925135');
INSERT INTO public.inventory VALUES (517, 259, 1, 0.00, '2026-11-07 20:36:43.926349');
INSERT INTO public.inventory VALUES (518, 259, 2, 5.00, '2026-11-07 20:36:43.926855');
INSERT INTO public.inventory VALUES (519, 260, 1, 0.00, '2026-11-07 20:36:43.927936');
INSERT INTO public.inventory VALUES (520, 260, 2, 2.00, '2026-11-07 20:36:43.928394');
INSERT INTO public.inventory VALUES (521, 261, 1, 0.00, '2026-11-07 20:36:43.929367');
INSERT INTO public.inventory VALUES (522, 261, 2, 0.00, '2026-11-07 20:36:43.929878');
INSERT INTO public.inventory VALUES (523, 262, 1, 0.00, '2026-11-07 20:36:43.93181');
INSERT INTO public.inventory VALUES (524, 262, 2, 0.00, '2026-11-07 20:36:43.933182');
INSERT INTO public.inventory VALUES (525, 263, 1, 0.00, '2026-11-07 20:36:43.935194');
INSERT INTO public.inventory VALUES (526, 263, 2, 1.00, '2026-11-07 20:36:43.936093');
INSERT INTO public.inventory VALUES (527, 264, 1, 0.00, '2026-11-07 20:36:43.937874');
INSERT INTO public.inventory VALUES (528, 264, 2, 0.00, '2026-11-07 20:36:43.938442');
INSERT INTO public.inventory VALUES (529, 265, 1, 0.00, '2026-11-07 20:36:43.939559');
INSERT INTO public.inventory VALUES (530, 265, 2, 0.00, '2026-11-07 20:36:43.940325');
INSERT INTO public.inventory VALUES (531, 266, 1, 0.00, '2026-11-07 20:36:43.942107');
INSERT INTO public.inventory VALUES (532, 266, 2, 135.00, '2026-11-07 20:36:43.942882');
INSERT INTO public.inventory VALUES (533, 267, 1, 0.00, '2026-11-07 20:36:43.944828');
INSERT INTO public.inventory VALUES (534, 267, 2, 3.00, '2026-11-07 20:36:43.94564');
INSERT INTO public.inventory VALUES (535, 268, 1, 0.00, '2026-11-07 20:36:43.947359');
INSERT INTO public.inventory VALUES (536, 268, 2, 59.00, '2026-11-07 20:36:43.94811');
INSERT INTO public.inventory VALUES (537, 269, 1, 0.00, '2026-11-07 20:36:43.949829');
INSERT INTO public.inventory VALUES (538, 269, 2, 0.00, '2026-11-07 20:36:43.950623');
INSERT INTO public.inventory VALUES (539, 270, 1, 0.00, '2026-11-07 20:36:43.952262');
INSERT INTO public.inventory VALUES (540, 270, 2, 25.00, '2026-11-07 20:36:43.952985');
INSERT INTO public.inventory VALUES (541, 271, 1, 0.00, '2026-11-07 20:36:43.954706');
INSERT INTO public.inventory VALUES (542, 271, 2, 0.00, '2026-11-07 20:36:43.955468');
INSERT INTO public.inventory VALUES (543, 272, 1, 0.00, '2026-11-07 20:36:43.957492');
INSERT INTO public.inventory VALUES (544, 272, 2, 5.00, '2026-11-07 20:36:43.95835');
INSERT INTO public.inventory VALUES (545, 273, 1, 0.00, '2026-11-07 20:36:43.960255');
INSERT INTO public.inventory VALUES (546, 273, 2, 27.00, '2026-11-07 20:36:43.961373');
INSERT INTO public.inventory VALUES (547, 274, 1, 0.00, '2026-11-07 20:36:43.9632');
INSERT INTO public.inventory VALUES (548, 274, 2, 20.00, '2026-11-07 20:36:43.96399');
INSERT INTO public.inventory VALUES (549, 275, 1, 0.00, '2026-11-07 20:36:43.965695');
INSERT INTO public.inventory VALUES (550, 275, 2, 3.00, '2026-11-07 20:36:43.966483');
INSERT INTO public.inventory VALUES (551, 276, 1, 0.00, '2026-11-07 20:36:43.968165');
INSERT INTO public.inventory VALUES (552, 276, 2, 2.00, '2026-11-07 20:36:43.968903');
INSERT INTO public.inventory VALUES (553, 277, 1, 0.00, '2026-11-07 20:36:43.970607');
INSERT INTO public.inventory VALUES (554, 277, 2, 3.00, '2026-11-07 20:36:43.971392');
INSERT INTO public.inventory VALUES (555, 278, 1, 0.00, '2026-11-07 20:36:43.973405');
INSERT INTO public.inventory VALUES (556, 278, 2, 3.00, '2026-11-07 20:36:43.97436');
INSERT INTO public.inventory VALUES (557, 279, 1, 0.00, '2026-11-07 20:36:43.976403');
INSERT INTO public.inventory VALUES (558, 279, 2, 1.00, '2026-11-07 20:36:43.977307');
INSERT INTO public.inventory VALUES (559, 280, 1, 0.00, '2026-11-07 20:36:43.979157');
INSERT INTO public.inventory VALUES (560, 280, 2, 0.00, '2026-11-07 20:36:43.979944');
INSERT INTO public.inventory VALUES (561, 281, 1, 0.00, '2026-11-07 20:36:43.981722');
INSERT INTO public.inventory VALUES (562, 281, 2, 0.00, '2026-11-07 20:36:43.982796');
INSERT INTO public.inventory VALUES (563, 282, 1, 0.00, '2026-11-07 20:36:43.985014');
INSERT INTO public.inventory VALUES (564, 282, 2, 3.00, '2026-11-07 20:36:43.985992');
INSERT INTO public.inventory VALUES (565, 283, 1, 0.00, '2026-11-07 20:36:43.988039');
INSERT INTO public.inventory VALUES (566, 283, 2, 9.00, '2026-11-07 20:36:43.988901');
INSERT INTO public.inventory VALUES (567, 284, 1, 0.00, '2026-11-07 20:36:43.990707');
INSERT INTO public.inventory VALUES (568, 284, 2, 0.00, '2026-11-07 20:36:43.991542');
INSERT INTO public.inventory VALUES (569, 285, 1, 0.00, '2026-11-07 20:36:43.993536');
INSERT INTO public.inventory VALUES (570, 285, 2, 3.00, '2026-11-07 20:36:43.994394');
INSERT INTO public.inventory VALUES (571, 286, 1, 0.00, '2026-11-07 20:36:43.996186');
INSERT INTO public.inventory VALUES (572, 286, 2, 0.00, '2026-11-07 20:36:43.996982');
INSERT INTO public.inventory VALUES (573, 287, 1, 0.00, '2026-11-07 20:36:43.998761');
INSERT INTO public.inventory VALUES (574, 287, 2, 0.00, '2026-11-07 20:36:43.999555');
INSERT INTO public.inventory VALUES (575, 288, 1, 0.00, '2026-11-07 20:36:44.001252');
INSERT INTO public.inventory VALUES (576, 288, 2, 0.00, '2026-11-07 20:36:44.002131');
INSERT INTO public.inventory VALUES (577, 289, 1, 0.00, '2026-11-07 20:36:44.003939');
INSERT INTO public.inventory VALUES (578, 289, 2, 3.00, '2026-11-07 20:36:44.004819');
INSERT INTO public.inventory VALUES (579, 290, 1, 0.00, '2026-11-07 20:36:44.006642');
INSERT INTO public.inventory VALUES (580, 290, 2, 3.00, '2026-11-07 20:36:44.007652');
INSERT INTO public.inventory VALUES (581, 291, 1, 0.00, '2026-11-07 20:36:44.009482');
INSERT INTO public.inventory VALUES (582, 291, 2, 0.00, '2026-11-07 20:36:44.010332');
INSERT INTO public.inventory VALUES (583, 292, 1, 0.00, '2026-11-07 20:36:44.012137');
INSERT INTO public.inventory VALUES (584, 292, 2, 4.00, '2026-11-07 20:36:44.01296');
INSERT INTO public.inventory VALUES (585, 293, 1, 0.00, '2026-11-07 20:36:44.014727');
INSERT INTO public.inventory VALUES (586, 293, 2, 7.00, '2026-11-07 20:36:44.015556');
INSERT INTO public.inventory VALUES (587, 294, 1, 0.00, '2026-11-07 20:36:44.01739');
INSERT INTO public.inventory VALUES (588, 294, 2, 4.00, '2026-11-07 20:36:44.018325');
INSERT INTO public.inventory VALUES (589, 295, 1, 0.00, '2026-11-07 20:36:44.020507');
INSERT INTO public.inventory VALUES (590, 295, 2, 0.00, '2026-11-07 20:36:44.021369');
INSERT INTO public.inventory VALUES (591, 296, 1, 0.00, '2026-11-07 20:36:44.023122');
INSERT INTO public.inventory VALUES (592, 296, 2, 3.00, '2026-11-07 20:36:44.023906');
INSERT INTO public.inventory VALUES (593, 297, 1, 0.00, '2026-11-07 20:36:44.025628');
INSERT INTO public.inventory VALUES (594, 297, 2, 4.00, '2026-11-07 20:36:44.02645');
INSERT INTO public.inventory VALUES (595, 298, 1, 0.00, '2026-11-07 20:36:44.02827');
INSERT INTO public.inventory VALUES (596, 298, 2, 0.00, '2026-11-07 20:36:44.029127');
INSERT INTO public.inventory VALUES (597, 299, 1, 0.00, '2026-11-07 20:36:44.030991');
INSERT INTO public.inventory VALUES (598, 299, 2, 1.00, '2026-11-07 20:36:44.031812');
INSERT INTO public.inventory VALUES (599, 300, 1, 0.00, '2026-11-07 20:36:44.033836');
INSERT INTO public.inventory VALUES (600, 300, 2, 2.00, '2026-11-07 20:36:44.034731');
INSERT INTO public.inventory VALUES (601, 301, 1, 0.00, '2026-11-07 20:36:44.036671');
INSERT INTO public.inventory VALUES (602, 301, 2, 0.00, '2026-11-07 20:36:44.037797');
INSERT INTO public.inventory VALUES (603, 302, 1, 0.00, '2026-11-07 20:36:44.039686');
INSERT INTO public.inventory VALUES (604, 302, 2, 0.00, '2026-11-07 20:36:44.040538');
INSERT INTO public.inventory VALUES (605, 303, 1, 0.00, '2026-11-07 20:36:44.042413');
INSERT INTO public.inventory VALUES (606, 303, 2, 3.00, '2026-11-07 20:36:44.043273');
INSERT INTO public.inventory VALUES (607, 304, 1, 0.00, '2026-11-07 20:36:44.045132');
INSERT INTO public.inventory VALUES (608, 304, 2, 0.00, '2026-11-07 20:36:44.045969');
INSERT INTO public.inventory VALUES (609, 305, 1, 0.00, '2026-11-07 20:36:44.047847');
INSERT INTO public.inventory VALUES (610, 305, 2, 0.00, '2026-11-07 20:36:44.048688');
INSERT INTO public.inventory VALUES (611, 306, 1, 0.00, '2026-11-07 20:36:44.050575');
INSERT INTO public.inventory VALUES (612, 306, 2, 22.00, '2026-11-07 20:36:44.051437');
INSERT INTO public.inventory VALUES (613, 307, 1, 0.00, '2026-11-07 20:36:44.053232');
INSERT INTO public.inventory VALUES (614, 307, 2, 0.00, '2026-11-07 20:36:44.053919');
INSERT INTO public.inventory VALUES (615, 308, 1, 0.00, '2026-11-07 20:36:44.0558');
INSERT INTO public.inventory VALUES (616, 308, 2, 82.00, '2026-11-07 20:36:44.056834');
INSERT INTO public.inventory VALUES (617, 309, 1, 0.00, '2026-11-07 20:36:44.058824');
INSERT INTO public.inventory VALUES (618, 309, 2, 16.00, '2026-11-07 20:36:44.059687');
INSERT INTO public.inventory VALUES (619, 310, 1, 0.00, '2026-11-07 20:36:44.061513');
INSERT INTO public.inventory VALUES (620, 310, 2, 8.00, '2026-11-07 20:36:44.062296');
INSERT INTO public.inventory VALUES (621, 311, 1, 0.00, '2026-11-07 20:36:44.064142');
INSERT INTO public.inventory VALUES (622, 311, 2, 0.00, '2026-11-07 20:36:44.064985');
INSERT INTO public.inventory VALUES (623, 312, 1, 0.00, '2026-11-07 20:36:44.066807');
INSERT INTO public.inventory VALUES (624, 312, 2, 2.00, '2026-11-07 20:36:44.067668');
INSERT INTO public.inventory VALUES (625, 313, 1, 0.00, '2026-11-07 20:36:44.069695');
INSERT INTO public.inventory VALUES (626, 313, 2, 0.00, '2026-11-07 20:36:44.070489');
INSERT INTO public.inventory VALUES (627, 314, 1, 0.00, '2026-11-07 20:36:44.072186');
INSERT INTO public.inventory VALUES (628, 314, 2, 12.00, '2026-11-07 20:36:44.072917');
INSERT INTO public.inventory VALUES (629, 315, 1, 0.00, '2026-11-07 20:36:44.074549');
INSERT INTO public.inventory VALUES (630, 315, 2, 1.00, '2026-11-07 20:36:44.075266');
INSERT INTO public.inventory VALUES (631, 316, 1, 0.00, '2026-11-07 20:36:44.076949');
INSERT INTO public.inventory VALUES (632, 316, 2, 0.00, '2026-11-07 20:36:44.07768');
INSERT INTO public.inventory VALUES (633, 317, 1, 0.00, '2026-11-07 20:36:44.079253');
INSERT INTO public.inventory VALUES (634, 317, 2, 0.00, '2026-11-07 20:36:44.079984');
INSERT INTO public.inventory VALUES (635, 318, 1, 0.00, '2026-11-07 20:36:44.081565');
INSERT INTO public.inventory VALUES (636, 318, 2, 12.00, '2026-11-07 20:36:44.082268');
INSERT INTO public.inventory VALUES (637, 319, 1, 0.00, '2026-11-07 20:36:44.083888');
INSERT INTO public.inventory VALUES (638, 319, 2, 3.00, '2026-11-07 20:36:44.084861');
INSERT INTO public.inventory VALUES (639, 320, 1, 0.00, '2026-11-07 20:36:44.086827');
INSERT INTO public.inventory VALUES (640, 320, 2, 0.00, '2026-11-07 20:36:44.087585');
INSERT INTO public.inventory VALUES (641, 321, 1, 0.00, '2026-11-07 20:36:44.089404');
INSERT INTO public.inventory VALUES (642, 321, 2, 12.00, '2026-11-07 20:36:44.090174');
INSERT INTO public.inventory VALUES (643, 322, 1, 0.00, '2026-11-07 20:36:44.091815');
INSERT INTO public.inventory VALUES (644, 322, 2, 0.00, '2026-11-07 20:36:44.092531');
INSERT INTO public.inventory VALUES (645, 323, 1, 0.00, '2026-11-07 20:36:44.094208');
INSERT INTO public.inventory VALUES (646, 323, 2, 0.00, '2026-11-07 20:36:44.094947');
INSERT INTO public.inventory VALUES (647, 324, 1, 0.00, '2026-11-07 20:36:44.096514');
INSERT INTO public.inventory VALUES (648, 324, 2, 0.00, '2026-11-07 20:36:44.09724');
INSERT INTO public.inventory VALUES (649, 325, 1, 0.00, '2026-11-07 20:36:44.098841');
INSERT INTO public.inventory VALUES (650, 325, 2, 0.00, '2026-11-07 20:36:44.099566');
INSERT INTO public.inventory VALUES (651, 326, 1, 0.00, '2026-11-07 20:36:44.101667');
INSERT INTO public.inventory VALUES (652, 326, 2, 9.00, '2026-11-07 20:36:44.102668');
INSERT INTO public.inventory VALUES (653, 327, 1, 0.00, '2026-11-07 20:36:44.104417');
INSERT INTO public.inventory VALUES (654, 327, 2, 10.00, '2026-11-07 20:36:44.105194');
INSERT INTO public.inventory VALUES (655, 328, 1, 0.00, '2026-11-07 20:36:44.106935');
INSERT INTO public.inventory VALUES (656, 328, 2, 0.00, '2026-11-07 20:36:44.107683');
INSERT INTO public.inventory VALUES (657, 329, 1, 0.00, '2026-11-07 20:36:44.109372');
INSERT INTO public.inventory VALUES (658, 329, 2, 6.00, '2026-11-07 20:36:44.110168');
INSERT INTO public.inventory VALUES (659, 330, 1, 0.00, '2026-11-07 20:36:44.1119');
INSERT INTO public.inventory VALUES (660, 330, 2, 0.00, '2026-11-07 20:36:44.11266');
INSERT INTO public.inventory VALUES (661, 331, 1, 0.00, '2026-11-07 20:36:44.114333');
INSERT INTO public.inventory VALUES (662, 331, 2, 3.00, '2026-11-07 20:36:44.115062');
INSERT INTO public.inventory VALUES (663, 332, 1, 0.00, '2026-11-07 20:36:44.116785');
INSERT INTO public.inventory VALUES (664, 332, 2, 4.00, '2026-11-07 20:36:44.117733');
INSERT INTO public.inventory VALUES (665, 333, 1, 0.00, '2026-11-07 20:36:44.119391');
INSERT INTO public.inventory VALUES (666, 333, 2, 2.00, '2026-11-07 20:36:44.120169');
INSERT INTO public.inventory VALUES (667, 334, 1, 0.00, '2026-11-07 20:36:44.121775');
INSERT INTO public.inventory VALUES (668, 334, 2, 5.00, '2026-11-07 20:36:44.122484');
INSERT INTO public.inventory VALUES (669, 335, 1, 0.00, '2026-11-07 20:36:44.124381');
INSERT INTO public.inventory VALUES (670, 335, 2, 6.00, '2026-11-07 20:36:44.125305');
INSERT INTO public.inventory VALUES (671, 336, 1, 0.00, '2026-11-07 20:36:44.126967');
INSERT INTO public.inventory VALUES (672, 336, 2, 38.00, '2026-11-07 20:36:44.1277');
INSERT INTO public.inventory VALUES (673, 337, 1, 0.00, '2026-11-07 20:36:44.129354');
INSERT INTO public.inventory VALUES (674, 337, 2, 10.00, '2026-11-07 20:36:44.130085');
INSERT INTO public.inventory VALUES (675, 338, 1, 0.00, '2026-11-07 20:36:44.13179');
INSERT INTO public.inventory VALUES (676, 338, 2, 51.00, '2026-11-07 20:36:44.132811');
INSERT INTO public.inventory VALUES (677, 339, 1, 0.00, '2026-11-07 20:36:44.135193');
INSERT INTO public.inventory VALUES (678, 339, 2, 0.00, '2026-11-07 20:36:44.136337');
INSERT INTO public.inventory VALUES (679, 340, 1, 0.00, '2026-11-07 20:36:44.143924');
INSERT INTO public.inventory VALUES (680, 340, 2, 1.00, '2026-11-07 20:36:44.145028');
INSERT INTO public.inventory VALUES (681, 341, 1, 0.00, '2026-11-07 20:36:44.147586');
INSERT INTO public.inventory VALUES (682, 341, 2, 0.00, '2026-11-07 20:36:44.148472');
INSERT INTO public.inventory VALUES (683, 342, 1, 0.00, '2026-11-07 20:36:44.150861');
INSERT INTO public.inventory VALUES (684, 342, 2, 0.00, '2026-11-07 20:36:44.151839');
INSERT INTO public.inventory VALUES (685, 343, 1, 0.00, '2026-11-07 20:36:44.153746');
INSERT INTO public.inventory VALUES (686, 343, 2, 14.00, '2026-11-07 20:36:44.154531');
INSERT INTO public.inventory VALUES (687, 344, 1, 0.00, '2026-11-07 20:36:44.157129');
INSERT INTO public.inventory VALUES (688, 344, 2, 2.00, '2026-11-07 20:36:44.158227');
INSERT INTO public.inventory VALUES (689, 345, 1, 0.00, '2026-11-07 20:36:44.16108');
INSERT INTO public.inventory VALUES (690, 345, 2, 0.00, '2026-11-07 20:36:44.162133');
INSERT INTO public.inventory VALUES (691, 346, 1, 0.00, '2026-11-07 20:36:44.164054');
INSERT INTO public.inventory VALUES (692, 346, 2, 2.00, '2026-11-07 20:36:44.165087');
INSERT INTO public.inventory VALUES (693, 347, 1, 0.00, '2026-11-07 20:36:44.168159');
INSERT INTO public.inventory VALUES (694, 347, 2, 5.00, '2026-11-07 20:36:44.170815');
INSERT INTO public.inventory VALUES (695, 348, 1, 0.00, '2026-11-07 20:36:44.173395');
INSERT INTO public.inventory VALUES (696, 348, 2, 2.00, '2026-11-07 20:36:44.17445');
INSERT INTO public.inventory VALUES (697, 349, 1, 0.00, '2026-11-07 20:36:44.178005');
INSERT INTO public.inventory VALUES (698, 349, 2, 50.00, '2026-11-07 20:36:44.179621');
INSERT INTO public.inventory VALUES (699, 350, 1, 0.00, '2026-11-07 20:36:44.182299');
INSERT INTO public.inventory VALUES (700, 350, 2, 16.00, '2026-11-07 20:36:44.183498');
INSERT INTO public.inventory VALUES (701, 351, 1, 0.00, '2026-11-07 20:36:44.186063');
INSERT INTO public.inventory VALUES (702, 351, 2, 0.00, '2026-11-07 20:36:44.187251');
INSERT INTO public.inventory VALUES (703, 352, 1, 0.00, '2026-11-07 20:36:44.189987');
INSERT INTO public.inventory VALUES (704, 352, 2, 8.00, '2026-11-07 20:36:44.191195');
INSERT INTO public.inventory VALUES (705, 353, 1, 0.00, '2026-11-07 20:36:44.19633');
INSERT INTO public.inventory VALUES (706, 353, 2, 0.00, '2026-11-07 20:36:44.197438');
INSERT INTO public.inventory VALUES (707, 354, 1, 0.00, '2026-11-07 20:36:44.201344');
INSERT INTO public.inventory VALUES (708, 354, 2, 88.00, '2026-11-07 20:36:44.202407');
INSERT INTO public.inventory VALUES (709, 355, 1, 0.00, '2026-11-07 20:36:44.20551');
INSERT INTO public.inventory VALUES (710, 355, 2, 0.00, '2026-11-07 20:36:44.206396');
INSERT INTO public.inventory VALUES (711, 356, 1, 0.00, '2026-11-07 20:36:44.213249');
INSERT INTO public.inventory VALUES (712, 356, 2, 3.00, '2026-11-07 20:36:44.214408');
INSERT INTO public.inventory VALUES (713, 357, 1, 0.00, '2026-11-07 20:36:44.21647');
INSERT INTO public.inventory VALUES (714, 357, 2, 0.00, '2026-11-07 20:36:44.218465');
INSERT INTO public.inventory VALUES (715, 358, 1, 0.00, '2026-11-07 20:36:44.220438');
INSERT INTO public.inventory VALUES (716, 358, 2, 2.00, '2026-11-07 20:36:44.221383');
INSERT INTO public.inventory VALUES (717, 359, 1, 0.00, '2026-11-07 20:36:44.225642');
INSERT INTO public.inventory VALUES (718, 359, 2, 0.00, '2026-11-07 20:36:44.228989');
INSERT INTO public.inventory VALUES (719, 360, 1, 0.00, '2026-11-07 20:36:44.230979');
INSERT INTO public.inventory VALUES (720, 360, 2, 2.00, '2026-11-07 20:36:44.232889');
INSERT INTO public.inventory VALUES (721, 361, 1, 0.00, '2026-11-07 20:36:44.23472');
INSERT INTO public.inventory VALUES (722, 361, 2, 1.00, '2026-11-07 20:36:44.235774');
INSERT INTO public.inventory VALUES (723, 362, 1, 0.00, '2026-11-07 20:36:44.237567');
INSERT INTO public.inventory VALUES (724, 362, 2, 2.00, '2026-11-07 20:36:44.238331');
INSERT INTO public.inventory VALUES (725, 363, 1, 0.00, '2026-11-07 20:36:44.241782');
INSERT INTO public.inventory VALUES (726, 363, 2, 1.00, '2026-11-07 20:36:44.242888');
INSERT INTO public.inventory VALUES (727, 364, 1, 0.00, '2026-11-07 20:36:44.246932');
INSERT INTO public.inventory VALUES (728, 364, 2, 1.00, '2026-11-07 20:36:44.24915');
INSERT INTO public.inventory VALUES (729, 365, 1, 0.00, '2026-11-07 20:36:44.251478');
INSERT INTO public.inventory VALUES (730, 365, 2, 105.00, '2026-11-07 20:36:44.252576');
INSERT INTO public.inventory VALUES (731, 366, 1, 0.00, '2026-11-07 20:36:44.255016');
INSERT INTO public.inventory VALUES (732, 366, 2, 54.00, '2026-11-07 20:36:44.256452');
INSERT INTO public.inventory VALUES (733, 367, 1, 0.00, '2026-11-07 20:36:44.258707');
INSERT INTO public.inventory VALUES (734, 367, 2, 37.00, '2026-11-07 20:36:44.259919');
INSERT INTO public.inventory VALUES (735, 368, 1, 0.00, '2026-11-07 20:36:44.262665');
INSERT INTO public.inventory VALUES (736, 368, 2, 3.00, '2026-11-07 20:36:44.263592');
INSERT INTO public.inventory VALUES (737, 369, 1, 0.00, '2026-11-07 20:36:44.265874');
INSERT INTO public.inventory VALUES (738, 369, 2, 6.00, '2026-11-07 20:36:44.26683');
INSERT INTO public.inventory VALUES (739, 370, 1, 0.00, '2026-11-07 20:36:44.268721');
INSERT INTO public.inventory VALUES (740, 370, 2, 0.00, '2026-11-07 20:36:44.269581');
INSERT INTO public.inventory VALUES (741, 371, 1, 0.00, '2026-11-07 20:36:44.271265');
INSERT INTO public.inventory VALUES (742, 371, 2, 0.00, '2026-11-07 20:36:44.272143');
INSERT INTO public.inventory VALUES (743, 372, 1, 0.00, '2026-11-07 20:36:44.274048');
INSERT INTO public.inventory VALUES (744, 372, 2, 29.00, '2026-11-07 20:36:44.274803');
INSERT INTO public.inventory VALUES (745, 373, 1, 0.00, '2026-11-07 20:36:44.276664');
INSERT INTO public.inventory VALUES (746, 373, 2, 8.00, '2026-11-07 20:36:44.277581');
INSERT INTO public.inventory VALUES (747, 374, 1, 0.00, '2026-11-07 20:36:44.279366');
INSERT INTO public.inventory VALUES (748, 374, 2, 8.00, '2026-11-07 20:36:44.280122');
INSERT INTO public.inventory VALUES (749, 375, 1, 0.00, '2026-11-07 20:36:44.281808');
INSERT INTO public.inventory VALUES (750, 375, 2, 16.00, '2026-11-07 20:36:44.282543');
INSERT INTO public.inventory VALUES (751, 376, 1, 0.00, '2026-11-07 20:36:44.284206');
INSERT INTO public.inventory VALUES (752, 376, 2, 6.00, '2026-11-07 20:36:44.28504');
INSERT INTO public.inventory VALUES (753, 377, 1, 0.00, '2026-11-07 20:36:44.286685');
INSERT INTO public.inventory VALUES (754, 377, 2, 10.00, '2026-11-07 20:36:44.287399');
INSERT INTO public.inventory VALUES (755, 378, 1, 0.00, '2026-11-07 20:36:44.290878');
INSERT INTO public.inventory VALUES (756, 378, 2, 0.00, '2026-11-07 20:36:44.291814');
INSERT INTO public.inventory VALUES (757, 379, 1, 0.00, '2026-11-07 20:36:44.294075');
INSERT INTO public.inventory VALUES (758, 379, 2, 0.00, '2026-11-07 20:36:44.295057');
INSERT INTO public.inventory VALUES (759, 380, 1, 0.00, '2026-11-07 20:36:44.296792');
INSERT INTO public.inventory VALUES (760, 380, 2, 0.00, '2026-11-07 20:36:44.297579');
INSERT INTO public.inventory VALUES (761, 381, 1, 0.00, '2026-11-07 20:36:44.299272');
INSERT INTO public.inventory VALUES (762, 381, 2, 20.00, '2026-11-07 20:36:44.3');
INSERT INTO public.inventory VALUES (763, 382, 1, 0.00, '2026-11-07 20:36:44.301614');
INSERT INTO public.inventory VALUES (764, 382, 2, 0.00, '2026-11-07 20:36:44.302401');
INSERT INTO public.inventory VALUES (765, 383, 1, 0.00, '2026-11-07 20:36:44.304953');
INSERT INTO public.inventory VALUES (766, 383, 2, 5.00, '2026-11-07 20:36:44.305938');
INSERT INTO public.inventory VALUES (767, 384, 1, 0.00, '2026-11-07 20:36:44.30805');
INSERT INTO public.inventory VALUES (768, 384, 2, 18.00, '2026-11-07 20:36:44.30903');
INSERT INTO public.inventory VALUES (769, 385, 1, 0.00, '2026-11-07 20:36:44.311665');
INSERT INTO public.inventory VALUES (770, 385, 2, 17.00, '2026-11-07 20:36:44.312535');
INSERT INTO public.inventory VALUES (771, 386, 1, 0.00, '2026-11-07 20:36:44.314245');
INSERT INTO public.inventory VALUES (772, 386, 2, 24.00, '2026-11-07 20:36:44.315028');
INSERT INTO public.inventory VALUES (773, 387, 1, 0.00, '2026-11-07 20:36:44.316738');
INSERT INTO public.inventory VALUES (774, 387, 2, 8.00, '2026-11-07 20:36:44.31768');
INSERT INTO public.inventory VALUES (775, 388, 1, 0.00, '2026-11-07 20:36:44.319768');
INSERT INTO public.inventory VALUES (776, 388, 2, 0.00, '2026-11-07 20:36:44.320671');
INSERT INTO public.inventory VALUES (777, 389, 1, 0.00, '2026-11-07 20:36:44.322757');
INSERT INTO public.inventory VALUES (778, 389, 2, 0.00, '2026-11-07 20:36:44.323701');
INSERT INTO public.inventory VALUES (779, 390, 1, 0.00, '2026-11-07 20:36:44.325893');
INSERT INTO public.inventory VALUES (780, 390, 2, 1.00, '2026-11-07 20:36:44.326893');
INSERT INTO public.inventory VALUES (781, 391, 1, 0.00, '2026-11-07 20:36:44.328712');
INSERT INTO public.inventory VALUES (782, 391, 2, 1.00, '2026-11-07 20:36:44.329508');
INSERT INTO public.inventory VALUES (783, 392, 1, 0.00, '2026-11-07 20:36:44.331151');
INSERT INTO public.inventory VALUES (784, 392, 2, 0.00, '2026-11-07 20:36:44.331999');
INSERT INTO public.inventory VALUES (785, 393, 1, 0.00, '2026-11-07 20:36:44.334209');
INSERT INTO public.inventory VALUES (786, 393, 2, 32.00, '2026-11-07 20:36:44.335175');
INSERT INTO public.inventory VALUES (787, 394, 1, 0.00, '2026-11-07 20:36:44.337295');
INSERT INTO public.inventory VALUES (788, 394, 2, 3.00, '2026-11-07 20:36:44.338267');
INSERT INTO public.inventory VALUES (789, 395, 1, 0.00, '2026-11-07 20:36:44.341008');
INSERT INTO public.inventory VALUES (790, 395, 2, 0.00, '2026-11-07 20:36:44.342012');
INSERT INTO public.inventory VALUES (791, 396, 1, 0.00, '2026-11-07 20:36:44.344265');
INSERT INTO public.inventory VALUES (792, 396, 2, 0.00, '2026-11-07 20:36:44.345293');
INSERT INTO public.inventory VALUES (793, 397, 1, 0.00, '2026-11-07 20:36:44.34742');
INSERT INTO public.inventory VALUES (794, 397, 2, 0.00, '2026-11-07 20:36:44.348334');
INSERT INTO public.inventory VALUES (795, 398, 1, 0.00, '2026-11-07 20:36:44.350011');
INSERT INTO public.inventory VALUES (796, 398, 2, 0.00, '2026-11-07 20:36:44.350733');
INSERT INTO public.inventory VALUES (797, 399, 1, 0.00, '2026-11-07 20:36:44.352369');
INSERT INTO public.inventory VALUES (798, 399, 2, 3.00, '2026-11-07 20:36:44.35332');
INSERT INTO public.inventory VALUES (799, 400, 1, 0.00, '2026-11-07 20:36:44.354996');
INSERT INTO public.inventory VALUES (800, 400, 2, 1.00, '2026-11-07 20:36:44.355719');
INSERT INTO public.inventory VALUES (801, 401, 1, 0.00, '2026-11-07 20:36:44.357371');
INSERT INTO public.inventory VALUES (802, 401, 2, 4.00, '2026-11-07 20:36:44.358123');
INSERT INTO public.inventory VALUES (803, 402, 1, 0.00, '2026-11-07 20:36:44.359923');
INSERT INTO public.inventory VALUES (804, 402, 2, 6.00, '2026-11-07 20:36:44.360722');
INSERT INTO public.inventory VALUES (805, 403, 1, 0.00, '2026-11-07 20:36:44.362362');
INSERT INTO public.inventory VALUES (806, 403, 2, 44.00, '2026-11-07 20:36:44.36311');
INSERT INTO public.inventory VALUES (807, 404, 1, 0.00, '2026-11-07 20:36:44.36472');
INSERT INTO public.inventory VALUES (808, 404, 2, 0.00, '2026-11-07 20:36:44.365478');
INSERT INTO public.inventory VALUES (809, 405, 1, 0.00, '2026-11-07 20:36:44.367587');
INSERT INTO public.inventory VALUES (810, 405, 2, 6.00, '2026-11-07 20:36:44.368745');
INSERT INTO public.inventory VALUES (811, 406, 1, 0.00, '2026-11-07 20:36:44.370839');
INSERT INTO public.inventory VALUES (812, 406, 2, 3.00, '2026-11-07 20:36:44.371803');
INSERT INTO public.inventory VALUES (813, 407, 1, 0.00, '2026-11-07 20:36:44.373943');
INSERT INTO public.inventory VALUES (814, 407, 2, 40.00, '2026-11-07 20:36:44.374913');
INSERT INTO public.inventory VALUES (815, 408, 1, 0.00, '2026-11-07 20:36:44.377135');
INSERT INTO public.inventory VALUES (816, 408, 2, 50.00, '2026-11-07 20:36:44.378075');
INSERT INTO public.inventory VALUES (817, 409, 1, 0.00, '2026-11-07 20:36:44.380235');
INSERT INTO public.inventory VALUES (818, 409, 2, 0.00, '2026-11-07 20:36:44.381216');
INSERT INTO public.inventory VALUES (819, 410, 1, 0.00, '2026-11-07 20:36:44.383304');
INSERT INTO public.inventory VALUES (820, 410, 2, 28.00, '2026-11-07 20:36:44.384219');
INSERT INTO public.inventory VALUES (821, 411, 1, 0.00, '2026-11-07 20:36:44.38603');
INSERT INTO public.inventory VALUES (822, 411, 2, 0.00, '2026-11-07 20:36:44.386763');
INSERT INTO public.inventory VALUES (823, 412, 1, 0.00, '2026-11-07 20:36:44.388393');
INSERT INTO public.inventory VALUES (824, 412, 2, 0.00, '2026-11-07 20:36:44.389178');
INSERT INTO public.inventory VALUES (825, 413, 1, 0.00, '2026-11-07 20:36:44.390857');
INSERT INTO public.inventory VALUES (826, 413, 2, 0.00, '2026-11-07 20:36:44.391458');
INSERT INTO public.inventory VALUES (827, 414, 1, 0.00, '2026-11-07 20:36:44.392636');
INSERT INTO public.inventory VALUES (828, 414, 2, 9.00, '2026-11-07 20:36:44.393139');
INSERT INTO public.inventory VALUES (829, 415, 1, 0.00, '2026-11-07 20:36:44.394179');
INSERT INTO public.inventory VALUES (830, 415, 2, 5.00, '2026-11-07 20:36:44.394625');
INSERT INTO public.inventory VALUES (831, 416, 1, 0.00, '2026-11-07 20:36:44.395625');
INSERT INTO public.inventory VALUES (832, 416, 2, 0.00, '2026-11-07 20:36:44.396054');
INSERT INTO public.inventory VALUES (833, 417, 1, 0.00, '2026-11-07 20:36:44.397069');
INSERT INTO public.inventory VALUES (834, 417, 2, 2.00, '2026-11-07 20:36:44.397514');
INSERT INTO public.inventory VALUES (835, 418, 1, 0.00, '2026-11-07 20:36:44.398497');
INSERT INTO public.inventory VALUES (836, 418, 2, 2.00, '2026-11-07 20:36:44.398939');
INSERT INTO public.inventory VALUES (837, 419, 1, 0.00, '2026-11-07 20:36:44.40031');
INSERT INTO public.inventory VALUES (838, 419, 2, 1.00, '2026-11-07 20:36:44.401172');
INSERT INTO public.inventory VALUES (839, 420, 1, 0.00, '2026-11-07 20:36:44.403252');
INSERT INTO public.inventory VALUES (840, 420, 2, 1.00, '2026-11-07 20:36:44.404092');
INSERT INTO public.inventory VALUES (841, 421, 1, 0.00, '2026-11-07 20:36:44.40553');
INSERT INTO public.inventory VALUES (842, 421, 2, 1.00, '2026-11-07 20:36:44.406054');
INSERT INTO public.inventory VALUES (843, 422, 1, 0.00, '2026-11-07 20:36:44.407451');
INSERT INTO public.inventory VALUES (844, 422, 2, 1.00, '2026-11-07 20:36:44.408013');
INSERT INTO public.inventory VALUES (845, 423, 1, 0.00, '2026-11-07 20:36:44.409111');
INSERT INTO public.inventory VALUES (846, 423, 2, 0.00, '2026-11-07 20:36:44.409545');
INSERT INTO public.inventory VALUES (847, 424, 1, 0.00, '2026-11-07 20:36:44.410525');
INSERT INTO public.inventory VALUES (848, 424, 2, 5.00, '2026-11-07 20:36:44.410968');
INSERT INTO public.inventory VALUES (849, 425, 1, 0.00, '2026-11-07 20:36:44.411948');
INSERT INTO public.inventory VALUES (850, 425, 2, 0.00, '2026-11-07 20:36:44.412369');
INSERT INTO public.inventory VALUES (851, 426, 1, 0.00, '2026-11-07 20:36:44.413333');
INSERT INTO public.inventory VALUES (852, 426, 2, 0.00, '2026-11-07 20:36:44.41376');
INSERT INTO public.inventory VALUES (853, 427, 1, 0.00, '2026-11-07 20:36:44.414733');
INSERT INTO public.inventory VALUES (854, 427, 2, 0.00, '2026-11-07 20:36:44.415266');
INSERT INTO public.inventory VALUES (855, 428, 1, 0.00, '2026-11-07 20:36:44.417154');
INSERT INTO public.inventory VALUES (856, 428, 2, 0.00, '2026-11-07 20:36:44.417856');
INSERT INTO public.inventory VALUES (857, 429, 1, 0.00, '2026-11-07 20:36:44.419086');
INSERT INTO public.inventory VALUES (858, 429, 2, 0.00, '2026-11-07 20:36:44.419646');
INSERT INTO public.inventory VALUES (859, 430, 1, 0.00, '2026-11-07 20:36:44.420704');
INSERT INTO public.inventory VALUES (860, 430, 2, 0.00, '2026-11-07 20:36:44.421149');
INSERT INTO public.inventory VALUES (861, 431, 1, 0.00, '2026-11-07 20:36:44.422164');
INSERT INTO public.inventory VALUES (862, 431, 2, 0.00, '2026-11-07 20:36:44.422648');
INSERT INTO public.inventory VALUES (863, 432, 1, 0.00, '2026-11-07 20:36:44.423646');
INSERT INTO public.inventory VALUES (864, 432, 2, 0.00, '2026-11-07 20:36:44.4241');
INSERT INTO public.inventory VALUES (865, 433, 1, 0.00, '2026-11-07 20:36:44.425139');
INSERT INTO public.inventory VALUES (866, 433, 2, 2.00, '2026-11-07 20:36:44.425607');
INSERT INTO public.inventory VALUES (867, 434, 1, 0.00, '2026-11-07 20:36:44.42659');
INSERT INTO public.inventory VALUES (868, 434, 2, 0.00, '2026-11-07 20:36:44.427024');
INSERT INTO public.inventory VALUES (869, 435, 1, 0.00, '2026-11-07 20:36:44.428018');
INSERT INTO public.inventory VALUES (870, 435, 2, 4.00, '2026-11-07 20:36:44.428445');
INSERT INTO public.inventory VALUES (871, 436, 1, 0.00, '2026-11-07 20:36:44.430106');
INSERT INTO public.inventory VALUES (872, 436, 2, 0.00, '2026-11-07 20:36:44.431346');
INSERT INTO public.inventory VALUES (873, 437, 1, 0.00, '2026-11-07 20:36:44.434148');
INSERT INTO public.inventory VALUES (874, 437, 2, 18.00, '2026-11-07 20:36:44.435095');
INSERT INTO public.inventory VALUES (875, 438, 1, 0.00, '2026-11-07 20:36:44.436826');
INSERT INTO public.inventory VALUES (876, 438, 2, 0.00, '2026-11-07 20:36:44.437427');
INSERT INTO public.inventory VALUES (877, 439, 1, 0.00, '2026-11-07 20:36:44.438529');
INSERT INTO public.inventory VALUES (878, 439, 2, 250.00, '2026-11-07 20:36:44.438977');
INSERT INTO public.inventory VALUES (879, 440, 1, 0.00, '2026-11-07 20:36:44.440003');
INSERT INTO public.inventory VALUES (880, 440, 2, 0.00, '2026-11-07 20:36:44.440448');
INSERT INTO public.inventory VALUES (881, 441, 1, 0.00, '2026-11-07 20:36:44.44333');
INSERT INTO public.inventory VALUES (882, 441, 2, 0.00, '2026-11-07 20:36:44.444077');
INSERT INTO public.inventory VALUES (883, 442, 1, 0.00, '2026-11-07 20:36:44.445451');
INSERT INTO public.inventory VALUES (884, 442, 2, 0.00, '2026-11-07 20:36:44.445963');
INSERT INTO public.inventory VALUES (885, 443, 1, 0.00, '2026-11-07 20:36:44.447011');
INSERT INTO public.inventory VALUES (886, 443, 2, 0.00, '2026-11-07 20:36:44.447533');
INSERT INTO public.inventory VALUES (887, 444, 1, 0.00, '2026-11-07 20:36:44.449151');
INSERT INTO public.inventory VALUES (888, 444, 2, 0.00, '2026-11-07 20:36:44.449997');
INSERT INTO public.inventory VALUES (889, 445, 1, 0.00, '2026-11-07 20:36:44.451829');
INSERT INTO public.inventory VALUES (890, 445, 2, 2.00, '2026-11-07 20:36:44.452416');
INSERT INTO public.inventory VALUES (891, 446, 1, 0.00, '2026-11-07 20:36:44.453632');
INSERT INTO public.inventory VALUES (892, 446, 2, 4.00, '2026-11-07 20:36:44.454111');
INSERT INTO public.inventory VALUES (893, 447, 1, 0.00, '2026-11-07 20:36:44.45562');
INSERT INTO public.inventory VALUES (894, 447, 2, 2.00, '2026-11-07 20:36:44.456276');
INSERT INTO public.inventory VALUES (895, 448, 1, 0.00, '2026-11-07 20:36:44.457597');
INSERT INTO public.inventory VALUES (896, 448, 2, 11.00, '2026-11-07 20:36:44.458115');
INSERT INTO public.inventory VALUES (897, 449, 1, 0.00, '2026-11-07 20:36:44.459642');
INSERT INTO public.inventory VALUES (898, 449, 2, 2.00, '2026-11-07 20:36:44.460608');
INSERT INTO public.inventory VALUES (899, 450, 1, 0.00, '2026-11-07 20:36:44.462367');
INSERT INTO public.inventory VALUES (900, 450, 2, 3.00, '2026-11-07 20:36:44.462967');
INSERT INTO public.inventory VALUES (901, 451, 1, 0.00, '2026-11-07 20:36:44.464144');
INSERT INTO public.inventory VALUES (902, 451, 2, 2.00, '2026-11-07 20:36:44.464957');
INSERT INTO public.inventory VALUES (903, 452, 1, 0.00, '2026-11-07 20:36:44.467334');
INSERT INTO public.inventory VALUES (904, 452, 2, 3.00, '2026-11-07 20:36:44.468141');


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.items VALUES (8, 'ITM-00008', 'BAYCLIN (12)', 3, 1, 10.00, 5.00, 14500.00, 'Active', '2026-11-07 20:36:43.204716', '2028-06-01');
INSERT INTO public.items VALUES (1, 'ITM-00001', 'AJINOMOTO 500 GRAM  (24)', 1, 1, 15.00, 5.00, 25750.00, 'Active', '2026-11-07 20:36:43.177059', '2028-07-25');
INSERT INTO public.items VALUES (2, 'ITM-00002', 'ALAS NASI 20X20', 1, 1, 25.00, 12.00, 350.00, 'Active', '2026-11-07 20:36:43.184883', NULL);
INSERT INTO public.items VALUES (3, 'ITM-00003', 'ALAT PEMANGGANG', 4, 1, 10.00, 5.00, 185000.00, 'Active', '2026-11-07 20:36:43.188753', NULL);
INSERT INTO public.items VALUES (4, 'ITM-00004', 'ALKALINE VOLT', 4, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.192672', NULL);
INSERT INTO public.items VALUES (5, 'ITM-00005', 'ALKALINE (2)', 4, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.196457', NULL);
INSERT INTO public.items VALUES (6, 'ITM-00006', 'ALKALINE (6)', 4, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.199142', NULL);
INSERT INTO public.items VALUES (7, 'ITM-00007', 'ASAM JAWA', 1, 1, 10.00, 5.00, 8000.00, 'Active', '2026-11-07 20:36:43.201525', NULL);
INSERT INTO public.items VALUES (9, 'ITM-00009', 'BAYGON', 3, 1, 10.00, 5.00, 38500.00, 'Active', '2026-11-07 20:36:43.207067', NULL);
INSERT INTO public.items VALUES (10, 'ITM-00010', 'BERAS KARYAWAN (10)', 1, 3, 10.00, 5.00, 14500.00, 'Active', '2026-11-07 20:36:43.210212', NULL);
INSERT INTO public.items VALUES (11, 'ITM-00011', 'BERAS ROYAL REGAL', 1, 3, 10.00, 5.00, 17250.00, 'Active', '2026-11-07 20:36:43.213241', '2027-08-15');
INSERT INTO public.items VALUES (12, 'ITM-00012', 'BERAS SOVIA', 1, 3, 10.00, 5.00, 14500.00, 'Active', '2026-11-07 20:36:43.215604', NULL);
INSERT INTO public.items VALUES (13, 'ITM-00013', 'BEST FRESH WRAPING', 1, 7, 10.00, 5.00, 130000.00, 'Active', '2026-11-07 20:36:43.217678', NULL);
INSERT INTO public.items VALUES (14, 'ITM-00014', 'BIHUN', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.220768', NULL);
INSERT INTO public.items VALUES (15, 'ITM-00015', 'BLU9 330 ML', 1, 1, 40.00, 15.00, 2500.00, 'Active', '2026-11-07 20:36:43.22378', NULL);
INSERT INTO public.items VALUES (16, 'ITM-00016', 'BLU9 600 ML', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.226483', NULL);
INSERT INTO public.items VALUES (17, 'ITM-00017', 'BOX PIZZA LAMA', 1, 9, 10.00, 5.00, 3200.00, 'Active', '2026-11-07 20:36:43.229309', NULL);
INSERT INTO public.items VALUES (18, 'ITM-00018', 'BOX DANGAU PUTIH', 1, 9, 10.00, 5.00, 2200.00, 'Active', '2026-11-07 20:36:43.232124', NULL);
INSERT INTO public.items VALUES (19, 'ITM-00019', 'BOX 20X20', 1, 9, 10.00, 5.00, 1850.00, 'Active', '2026-11-07 20:36:43.235135', NULL);
INSERT INTO public.items VALUES (20, 'ITM-00020', 'BOX MAHKOTA', 1, 9, 40.00, 15.00, 1500.00, 'Active', '2026-11-07 20:36:43.238332', NULL);
INSERT INTO public.items VALUES (21, 'ITM-00021', 'BROWNIES', 1, 1, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:43.241242', NULL);
INSERT INTO public.items VALUES (22, 'ITM-00022', 'CAPPUCINO (50)', 1, 1, 10.00, 5.00, 3500.00, 'Active', '2026-11-07 20:36:43.245044', '2031-12-01');
INSERT INTO public.items VALUES (23, 'ITM-00023', 'CLING', 3, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:43.248304', NULL);
INSERT INTO public.items VALUES (24, 'ITM-00024', 'CLUB GELAS 220ML', 1, 1, 100.00, 30.00, 650.00, 'Active', '2026-11-07 20:36:43.251384', NULL);
INSERT INTO public.items VALUES (25, 'ITM-00025', 'CRYSTALIN 600 ML', 1, 1, 40.00, 15.00, 2076.00, 'Active', '2026-11-07 20:36:43.254382', NULL);
INSERT INTO public.items VALUES (26, 'ITM-00026', 'CUKA MAKAN', 1, 1, 10.00, 5.00, 6500.00, 'Active', '2026-11-07 20:36:43.257193', '2030-05-01');
INSERT INTO public.items VALUES (27, 'ITM-00027', 'CUP CAKE 5 CM', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.259258', NULL);
INSERT INTO public.items VALUES (28, 'ITM-00028', 'CUP CAKE 70CM', 1, 1, 10.00, 5.00, 23000.00, 'Active', '2026-11-07 20:36:43.263287', NULL);
INSERT INTO public.items VALUES (29, 'ITM-00029', 'CUP CAKE 9CM', 1, 1, 10.00, 5.00, 29000.00, 'Active', '2026-11-07 20:36:43.268032', NULL);
INSERT INTO public.items VALUES (30, 'ITM-00030', 'CUP KUE UK 5.5', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.271276', NULL);
INSERT INTO public.items VALUES (31, 'ITM-00031', 'CUP KUE UK 70MM', 1, 1, 10.00, 5.00, 23000.00, 'Active', '2026-11-07 20:36:43.279599', NULL);
INSERT INTO public.items VALUES (32, 'ITM-00032', 'CUP KUE UK 95MM', 1, 1, 10.00, 5.00, 29000.00, 'Active', '2026-11-07 20:36:43.283291', NULL);
INSERT INTO public.items VALUES (33, 'ITM-00033', 'DAIA KECIL (24) (245 Gram)', 1, 1, 10.00, 5.00, 4250.00, 'Active', '2026-11-07 20:36:43.286827', NULL);
INSERT INTO public.items VALUES (34, 'ITM-00034', 'DETERJEN LAUNDRY', 3, 1, 10.00, 5.00, 55000.00, 'Active', '2026-11-07 20:36:43.290792', NULL);
INSERT INTO public.items VALUES (35, 'ITM-00035', 'EKONOMI (12)', 1, 1, 10.00, 5.00, 7900.00, 'Active', '2026-11-07 20:36:43.295038', NULL);
INSERT INTO public.items VALUES (36, 'ITM-00036', 'EMPING (5kg)', 1, 3, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.300088', NULL);
INSERT INTO public.items VALUES (37, 'ITM-00037', 'GARAM', 1, 3, 20.00, 8.00, 1725.00, 'Active', '2026-11-07 20:36:43.30444', '2031-12-01');
INSERT INTO public.items VALUES (38, 'ITM-00038', 'GARPU BUAH', 1, 1, 10.00, 5.00, 7000.00, 'Active', '2026-11-07 20:36:43.308216', NULL);
INSERT INTO public.items VALUES (39, 'ITM-00039', 'GELAS', 1, 1, 10.00, 5.00, 650.00, 'Active', '2026-11-07 20:36:43.313036', NULL);
INSERT INTO public.items VALUES (40, 'ITM-00040', 'GULA MERAH', 1, 3, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.317144', NULL);
INSERT INTO public.items VALUES (41, 'ITM-00041', 'GULA HOTEL (100)', 1, 1, 100.00, 30.00, 324.00, 'Active', '2026-11-07 20:36:43.321251', '2028-07-06');
INSERT INTO public.items VALUES (42, 'ITM-00042', 'GULA PASIR', 1, 3, 10.00, 5.00, 17500.00, 'Active', '2026-11-07 20:36:43.325604', '2028-07-22');
INSERT INTO public.items VALUES (43, 'ITM-00043', 'HAND SOAP', 3, 1, 10.00, 5.00, 55000.00, 'Active', '2026-11-07 20:36:43.330825', NULL);
INSERT INTO public.items VALUES (44, 'ITM-00044', 'HD NICO PUTIH SUSU 28', 1, 10, 10.00, 5.00, 16000.00, 'Active', '2026-11-07 20:36:43.334986', NULL);
INSERT INTO public.items VALUES (45, 'ITM-00045', 'INDOMIE GORENG', 1, 11, 10.00, 5.00, 3000.00, 'Active', '2026-11-07 20:36:43.339291', NULL);
INSERT INTO public.items VALUES (46, 'ITM-00046', 'INDOMIE KALDU', 1, 11, 10.00, 5.00, 2650.00, 'Active', '2026-11-07 20:36:43.34398', NULL);
INSERT INTO public.items VALUES (47, 'ITM-00047', 'INDOMIE SOTO', 1, 11, 10.00, 5.00, 2923.00, 'Active', '2026-11-07 20:36:43.352515', NULL);
INSERT INTO public.items VALUES (48, 'ITM-00048', 'K.20X20', 1, 1, 10.00, 5.00, 1850.00, 'Active', '2026-11-07 20:36:43.358172', NULL);
INSERT INTO public.items VALUES (49, 'ITM-00049', 'K.12X25 (TUNA)', 1, 12, 10.00, 5.00, 5800.00, 'Active', '2026-11-07 20:36:43.366306', NULL);
INSERT INTO public.items VALUES (50, 'ITM-00050', 'K.14X20', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.370828', NULL);
INSERT INTO public.items VALUES (51, 'ITM-00051', 'K.15X30', 1, 1, 10.00, 5.00, 5400.00, 'Active', '2026-11-07 20:36:43.376439', NULL);
INSERT INTO public.items VALUES (52, 'ITM-00052', 'K.15X35', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.381575', NULL);
INSERT INTO public.items VALUES (53, 'ITM-00053', 'K.16X23', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.385277', NULL);
INSERT INTO public.items VALUES (54, 'ITM-00054', 'K.16X24', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.388558', NULL);
INSERT INTO public.items VALUES (55, 'ITM-00055', 'K.17X40 (isi 5) tuna', 1, 12, 10.00, 5.00, 5400.00, 'Active', '2026-11-07 20:36:43.392159', NULL);
INSERT INTO public.items VALUES (56, 'ITM-00056', 'K.9X15', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.39585', NULL);
INSERT INTO public.items VALUES (57, 'ITM-00057', 'KANTONG HD 24', 1, 10, 10.00, 5.00, 16000.00, 'Active', '2026-11-07 20:36:43.399358', NULL);
INSERT INTO public.items VALUES (58, 'ITM-00058', 'KANTONG PUTIH HD 17', 1, 10, 10.00, 5.00, 16000.00, 'Active', '2026-11-07 20:36:43.402473', NULL);
INSERT INTO public.items VALUES (59, 'ITM-00059', 'KANTONG 10X17', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.405934', NULL);
INSERT INTO public.items VALUES (60, 'ITM-00060', 'KANTONG 10X17 KLIP', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.40897', NULL);
INSERT INTO public.items VALUES (61, 'ITM-00061', 'KANTONG 14X22 KLIP', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.412637', NULL);
INSERT INTO public.items VALUES (62, 'ITM-00062', 'KANTONG 14X22', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.415918', NULL);
INSERT INTO public.items VALUES (63, 'ITM-00063', 'KANTONG 17 PUTIH SUSU', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.419156', NULL);
INSERT INTO public.items VALUES (64, 'ITM-00064', 'KANTONG 40X60 (LAUNDRY)', 1, 10, 100.00, 30.00, 24000.00, 'Active', '2026-11-07 20:36:43.42231', NULL);
INSERT INTO public.items VALUES (65, 'ITM-00065', 'KANTONG 80X130', 1, 10, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.425247', NULL);
INSERT INTO public.items VALUES (66, 'ITM-00066', 'KANTONG HDPE ANTI PANAS', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.427858', NULL);
INSERT INTO public.items VALUES (67, 'ITM-00067', 'KARBOL SEREH', 3, 1, 10.00, 5.00, 75000.00, 'Active', '2026-11-07 20:36:43.430508', NULL);
INSERT INTO public.items VALUES (68, 'ITM-00068', 'KECAP ASIN', 1, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:43.433083', '2029-05-06');
INSERT INTO public.items VALUES (69, 'ITM-00069', 'KECAP IKAN', 1, 1, 10.00, 5.00, 22000.00, 'Active', '2026-11-07 20:36:43.436303', '2029-08-01');
INSERT INTO public.items VALUES (70, 'ITM-00070', 'KECAP MANIS INDOFOOD 5,7', 1, 1, 10.00, 5.00, 135700.00, 'Active', '2026-11-07 20:36:43.439515', '2028-08-05');
INSERT INTO public.items VALUES (71, 'ITM-00071', 'KERTAS BAPAU 7CM', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.442494', NULL);
INSERT INTO public.items VALUES (72, 'ITM-00072', 'KERTAS BAPAU 6', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.445814', NULL);
INSERT INTO public.items VALUES (73, 'ITM-00073', 'KERUPUK 18', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.449052', NULL);
INSERT INTO public.items VALUES (74, 'ITM-00074', 'KERUPUK UDANG', 1, 3, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.452174', NULL);
INSERT INTO public.items VALUES (75, 'ITM-00075', 'KOPI BIJI', 1, 1, 10.00, 5.00, 150000.00, 'Active', '2026-11-07 20:36:43.455821', '2027-09-15');
INSERT INTO public.items VALUES (76, 'ITM-00076', 'KOPI BUBUK', 1, 1, 10.00, 5.00, 120000.00, 'Active', '2026-11-07 20:36:43.459236', NULL);
INSERT INTO public.items VALUES (77, 'ITM-00077', 'KOPI NESCAFE', 1, 1, 100.00, 30.00, 1850.00, 'Active', '2026-11-07 20:36:43.462699', '2028-07-01');
INSERT INTO public.items VALUES (78, 'ITM-00078', 'KOTAK 16X16', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.466178', NULL);
INSERT INTO public.items VALUES (79, 'ITM-00079', 'KOTAK KUE 12X12', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.469235', NULL);
INSERT INTO public.items VALUES (80, 'ITM-00080', 'KOTAK KUE 25X25', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.472692', NULL);
INSERT INTO public.items VALUES (81, 'ITM-00081', 'KOTAK KUE PUTIH POLOS UK 28', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.475743', NULL);
INSERT INTO public.items VALUES (82, 'ITM-00082', 'KOTAK NASI 20X20 (50)', 1, 1, 10.00, 5.00, 1850.00, 'Active', '2026-11-07 20:36:43.478954', NULL);
INSERT INTO public.items VALUES (83, 'ITM-00083', 'KOTAK PIZZA KECIL', 1, 1, 10.00, 5.00, 3200.00, 'Active', '2026-11-07 20:36:43.481744', NULL);
INSERT INTO public.items VALUES (84, 'ITM-00084', 'KOTAK PIZZA SEGI 4', 1, 1, 10.00, 5.00, 3200.00, 'Active', '2026-11-07 20:36:43.484427', NULL);
INSERT INTO public.items VALUES (85, 'ITM-00085', 'KOTAK SUSHI', 1, 1, 10.00, 5.00, 2200.00, 'Active', '2026-11-07 20:36:43.486332', NULL);
INSERT INTO public.items VALUES (86, 'ITM-00086', 'KOTAK TAKEAWAY DANGAU 20X20', 1, 1, 100.00, 30.00, 1650.00, 'Active', '2026-11-07 20:36:43.488794', NULL);
INSERT INTO public.items VALUES (87, 'ITM-00087', 'LILIN LAMPU', 2, 1, 10.00, 5.00, 5000.00, 'Active', '2026-11-07 20:36:43.49164', NULL);
INSERT INTO public.items VALUES (88, 'ITM-00088', 'LOGO DANGAU COKLAT', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.494487', NULL);
INSERT INTO public.items VALUES (89, 'ITM-00089', 'LONGAN', 1, 1, 10.00, 5.00, 32000.00, 'Active', '2026-11-07 20:36:43.496556', NULL);
INSERT INTO public.items VALUES (90, 'ITM-00090', 'MAIZENA (150 GR)', 1, 1, 10.00, 5.00, 7500.00, 'Active', '2026-11-07 20:36:43.498283', NULL);
INSERT INTO public.items VALUES (91, 'ITM-00091', 'MAMA LEMON (12)', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.499934', NULL);
INSERT INTO public.items VALUES (92, 'ITM-00092', 'MARJAN COCOPANDAN', 1, 8, 10.00, 5.00, 21833.00, 'Active', '2026-11-07 20:36:43.502826', '2029-03-07');
INSERT INTO public.items VALUES (93, 'ITM-00093', 'MARJAN GRORADINO', 1, 8, 10.00, 5.00, 24975.00, 'Active', '2026-11-07 20:36:43.505451', NULL);
INSERT INTO public.items VALUES (94, 'ITM-00094', 'MARJAN LECI', 1, 8, 10.00, 5.00, 29000.00, 'Active', '2026-11-07 20:36:43.50738', '2029-07-08');
INSERT INTO public.items VALUES (95, 'ITM-00095', 'MARJAN MELON (12)', 1, 8, 10.00, 5.00, 24975.00, 'Active', '2026-11-07 20:36:43.509059', '2029-08-21');
INSERT INTO public.items VALUES (96, 'ITM-00096', 'MARJAN STROBERI', 1, 8, 10.00, 5.00, 29000.00, 'Active', '2026-11-07 20:36:43.510761', '2029-01-05');
INSERT INTO public.items VALUES (97, 'ITM-00097', 'MASAKO AYAM 460 GRAM', 1, 3, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.512314', NULL);
INSERT INTO public.items VALUES (98, 'ITM-00098', 'MASAKO SAPI 460 GRAM', 1, 11, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.5139', NULL);
INSERT INTO public.items VALUES (99, 'ITM-00099', 'MIE BOLA (12)', 1, 1, 10.00, 5.00, 11300.00, 'Active', '2026-11-07 20:36:43.51556', '2027-06-25');
INSERT INTO public.items VALUES (100, 'ITM-00100', 'MIKA NASI', 1, 1, 20.00, 8.00, 12000.00, 'Active', '2026-11-07 20:36:43.517717', NULL);
INSERT INTO public.items VALUES (101, 'ITM-00101', 'MIKA SEKAT NASI', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.519268', NULL);
INSERT INTO public.items VALUES (102, 'ITM-00102', 'MILO', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.521796', '2027-05-01');
INSERT INTO public.items VALUES (103, 'ITM-00103', 'MINYAK BIMOLI 18 Liter', 1, 8, 10.00, 5.00, 21500.00, 'Active', '2026-11-07 20:36:43.524426', NULL);
INSERT INTO public.items VALUES (104, 'ITM-00104', 'MINYAK WIJEN', 1, 1, 10.00, 5.00, 37421.00, 'Active', '2026-11-07 20:36:43.527221', NULL);
INSERT INTO public.items VALUES (105, 'ITM-00105', 'NATA DE COCO', 1, 1, 10.00, 5.00, 32000.00, 'Active', '2026-11-07 20:36:43.530933', NULL);
INSERT INTO public.items VALUES (106, 'ITM-00106', 'NESTLE 330ML', 1, 1, 40.00, 15.00, 2500.00, 'Active', '2026-11-07 20:36:43.532927', NULL);
INSERT INTO public.items VALUES (107, 'ITM-00107', 'NESTLE 600ML', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.534605', NULL);
INSERT INTO public.items VALUES (108, 'ITM-00108', 'NUTRISARI JERUK PERAS 500G', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.536164', '2027-08-09');
INSERT INTO public.items VALUES (109, 'ITM-00109', 'NUTRISARI LEMON TEA', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.538302', '2027-01-14');
INSERT INTO public.items VALUES (110, 'ITM-00110', 'PASQUA 330 ML', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.539924', NULL);
INSERT INTO public.items VALUES (111, 'ITM-00111', 'PASQUA 550 ML', 1, 1, 40.00, 15.00, 2500.00, 'Active', '2026-11-07 20:36:43.542715', NULL);
INSERT INTO public.items VALUES (112, 'ITM-00112', 'PASQUA 600ML', 1, 1, 10.00, 5.00, 2500.00, 'Active', '2026-11-07 20:36:43.545621', NULL);
INSERT INTO public.items VALUES (113, 'ITM-00113', 'PARFUM LAUNDRY', 3, 1, 10.00, 5.00, 180000.00, 'Active', '2026-11-07 20:36:43.548033', NULL);
INSERT INTO public.items VALUES (114, 'ITM-00114', 'PEMUTIH LAUNDRY', 3, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:43.550374', NULL);
INSERT INTO public.items VALUES (115, 'ITM-00115', 'PEMBERSIH KACA', 3, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:43.55206', NULL);
INSERT INTO public.items VALUES (116, 'ITM-00116', 'PEWANGI DAHLIA', 1, 1, 10.00, 5.00, 10300.00, 'Active', '2026-11-07 20:36:43.555548', NULL);
INSERT INTO public.items VALUES (117, 'ITM-00117', 'PEMBERSIH LANTAI', 3, 1, 10.00, 5.00, 50000.00, 'Active', '2026-11-07 20:36:43.557661', NULL);
INSERT INTO public.items VALUES (118, 'ITM-00118', 'PIRING', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.559259', NULL);
INSERT INTO public.items VALUES (119, 'ITM-00119', 'PLASTIK SHEET 20X20', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.562013', NULL);
INSERT INTO public.items VALUES (120, 'ITM-00120', 'PP FULL 14X20', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.564451', NULL);
INSERT INTO public.items VALUES (121, 'ITM-00121', 'ROYCO AYAM 460G (12)', 1, 3, 10.00, 5.00, 18750.00, 'Active', '2026-11-07 20:36:43.567104', '2027-06-29');
INSERT INTO public.items VALUES (122, 'ITM-00122', 'ROYCO SAPI 460G', 1, 11, 10.00, 5.00, 18750.00, 'Active', '2026-11-07 20:36:43.569453', NULL);
INSERT INTO public.items VALUES (123, 'ITM-00123', 'SABUN CAP KUCING', 3, 1, 20.00, 8.00, 3500.00, 'Active', '2026-11-07 20:36:43.571121', '2028-06-01');
INSERT INTO public.items VALUES (124, 'ITM-00124', 'SABUN MERAH', 3, 1, 20.00, 8.00, 3500.00, 'Active', '2026-11-07 20:36:43.572849', NULL);
INSERT INTO public.items VALUES (125, 'ITM-00125', 'SABUT HIJAU', 3, 1, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:43.575299', NULL);
INSERT INTO public.items VALUES (126, 'ITM-00126', 'SABUN HIJAU', 3, 1, 10.00, 5.00, 3500.00, 'Active', '2026-11-07 20:36:43.577668', NULL);
INSERT INTO public.items VALUES (127, 'ITM-00127', 'SANDAL', 2, 15, 100.00, 30.00, 3300.00, 'Active', '2026-11-07 20:36:43.580732', NULL);
INSERT INTO public.items VALUES (128, 'ITM-00128', 'SALF', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.583312', NULL);
INSERT INTO public.items VALUES (129, 'ITM-00129', 'SANTAN', 1, 1, 10.00, 5.00, 3800.00, 'Active', '2026-11-07 20:36:43.585996', NULL);
INSERT INTO public.items VALUES (130, 'ITM-00130', 'SAOS SAMBAL', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.587794', '2027-06-01');
INSERT INTO public.items VALUES (131, 'ITM-00131', 'SAOS TOMAT ABC', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.589502', '2027-07-23');
INSERT INTO public.items VALUES (132, 'ITM-00132', 'SATAY PASTA', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.591025', NULL);
INSERT INTO public.items VALUES (133, 'ITM-00133', 'SEAWED', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.592533', NULL);
INSERT INTO public.items VALUES (134, 'ITM-00134', 'SEDOTAN FLEXIBLE STRAW', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.595356', NULL);
INSERT INTO public.items VALUES (135, 'ITM-00135', 'SEDOTAN SAMURAI DANGAU', 1, 1, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:43.597207', NULL);
INSERT INTO public.items VALUES (136, 'ITM-00136', 'SENDOK MAKAN VICTORY (PP)', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:43.598762', NULL);
INSERT INTO public.items VALUES (137, 'ITM-00137', 'SHAMPOO PUTIH', 2, 1, 20.00, 8.00, 1800.00, 'Active', '2026-11-07 20:36:43.600241', NULL);
INSERT INTO public.items VALUES (138, 'ITM-00138', 'SHOWERCAP', 2, 1, 100.00, 30.00, 850.00, 'Active', '2026-11-07 20:36:43.601729', NULL);
INSERT INTO public.items VALUES (139, 'ITM-00139', 'SIKAT GIGI', 2, 1, 100.00, 30.00, 2150.00, 'Active', '2026-11-07 20:36:43.603143', NULL);
INSERT INTO public.items VALUES (140, 'ITM-00140', 'SISIR', 2, 1, 100.00, 30.00, 1250.00, 'Active', '2026-11-07 20:36:43.606187', NULL);
INSERT INTO public.items VALUES (141, 'ITM-00141', 'SOFTENER', 3, 1, 10.00, 5.00, 70000.00, 'Active', '2026-11-07 20:36:43.608746', NULL);
INSERT INTO public.items VALUES (142, 'ITM-00142', 'STANDING POUCH 10 X17 ( PLASTIK KLIP)', 1, 10, 10.00, 5.00, 1650.00, 'Active', '2026-11-07 20:36:43.611148', NULL);
INSERT INTO public.items VALUES (143, 'ITM-00143', 'STANDING POUCH 12X20', 1, 10, 10.00, 5.00, 1650.00, 'Active', '2026-11-07 20:36:43.61353', NULL);
INSERT INTO public.items VALUES (144, 'ITM-00144', 'STANDING POUCH 14X22CM', 1, 10, 10.00, 5.00, 1650.00, 'Active', '2026-11-07 20:36:43.616088', NULL);
INSERT INTO public.items VALUES (145, 'ITM-00145', 'STANDING POUCH 16X24', 1, 10, 10.00, 5.00, 1650.00, 'Active', '2026-11-07 20:36:43.618851', NULL);
INSERT INTO public.items VALUES (146, 'ITM-00146', 'STELLA KECIL', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.622029', NULL);
INSERT INTO public.items VALUES (147, 'ITM-00147', 'STELLA  (350+50)ml', 1, 1, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.624865', NULL);
INSERT INTO public.items VALUES (148, 'ITM-00148', 'STERNO', 1, 1, 20.00, 8.00, 6000.00, 'Active', '2026-11-07 20:36:43.629036', NULL);
INSERT INTO public.items VALUES (149, 'ITM-00149', 'SUSU DAIRY (24)', 1, 1, 10.00, 5.00, 23449.00, 'Active', '2026-11-07 20:36:43.6329', '2027-12-01');
INSERT INTO public.items VALUES (150, 'ITM-00150', 'SWALLOW BALL JMB 114', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.636053', NULL);
INSERT INTO public.items VALUES (151, 'ITM-00151', 'THE KOTAK SOSRO', 1, 9, 40.00, 15.00, 4000.00, 'Active', '2026-11-07 20:36:43.639747', '2027-03-15');
INSERT INTO public.items VALUES (152, 'ITM-00152', 'TEH CAP BOTOL', 1, 8, 20.00, 8.00, 4000.00, 'Active', '2026-11-07 20:36:43.644497', '2028-04-02');
INSERT INTO public.items VALUES (153, 'ITM-00153', 'TEH HOTEL ( Lipton isi 12)', 1, 1, 100.00, 30.00, 661.00, 'Active', '2026-11-07 20:36:43.648505', '2028-05-29');
INSERT INTO public.items VALUES (154, 'ITM-00154', 'TEH PRENDJAK', 1, 1, 20.00, 8.00, 2850.00, 'Active', '2026-11-07 20:36:43.652098', '2028-06-23');
INSERT INTO public.items VALUES (155, 'ITM-00155', 'TEPUNG DOUBLE ZERO', 1, 3, 20.00, 8.00, 14652.00, 'Active', '2026-11-07 20:36:43.655773', '2027-04-12');
INSERT INTO public.items VALUES (156, 'ITM-00156', 'TEPUNG KETAN', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:43.659568', '2027-07-07');
INSERT INTO public.items VALUES (157, 'ITM-00157', 'TEPUNG LENCANA MERAH', 1, 3, 10.00, 5.00, 9500.00, 'Active', '2026-11-07 20:36:43.663807', NULL);
INSERT INTO public.items VALUES (158, 'ITM-00158', 'TEPUNG ROTI', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:43.667436', NULL);
INSERT INTO public.items VALUES (159, 'ITM-00159', 'TEPUNG HERCULES', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:43.67105', NULL);
INSERT INTO public.items VALUES (160, 'ITM-00160', 'TEPUNG TERIGU', 1, 3, 10.00, 5.00, 14652.00, 'Active', '2026-11-07 20:36:43.677622', NULL);
INSERT INTO public.items VALUES (161, 'ITM-00161', 'TISSU BOX (24)', 1, 9, 10.00, 5.00, 14500.00, 'Active', '2026-11-07 20:36:43.68365', NULL);
INSERT INTO public.items VALUES (162, 'ITM-00162', 'TISSU ROLL (144)', 1, 7, 40.00, 15.00, 3800.00, 'Active', '2026-11-07 20:36:43.687663', NULL);
INSERT INTO public.items VALUES (163, 'ITM-00163', 'TISSU SENDOK (60)', 1, 1, 20.00, 8.00, 8500.00, 'Active', '2026-11-07 20:36:43.691905', NULL);
INSERT INTO public.items VALUES (164, 'ITM-00164', 'TISSU TOWEL/ TISU WASTAFEL (24)', 1, 1, 20.00, 8.00, 12500.00, 'Active', '2026-11-07 20:36:43.696485', NULL);
INSERT INTO public.items VALUES (165, 'ITM-00165', 'TISU FACIAL  (24)', 1, 1, 20.00, 8.00, 36938.00, 'Active', '2026-11-07 20:36:43.69946', NULL);
INSERT INTO public.items VALUES (166, 'ITM-00166', 'TISU POP UP (20)', 1, 1, 10.00, 5.00, 22500.00, 'Active', '2026-11-07 20:36:43.702851', NULL);
INSERT INTO public.items VALUES (167, 'ITM-00167', 'TISU PULPIES', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.706326', NULL);
INSERT INTO public.items VALUES (168, 'ITM-00168', 'TISU TAMU', 1, 1, 10.00, 5.00, 9500.00, 'Active', '2026-11-07 20:36:43.709141', NULL);
INSERT INTO public.items VALUES (169, 'ITM-00169', 'TUSUK SATE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.712973', NULL);
INSERT INTO public.items VALUES (170, 'ITM-00170', 'TUSUK BUAH BENING', 1, 1, 10.00, 5.00, 7000.00, 'Active', '2026-11-07 20:36:43.715677', NULL);
INSERT INTO public.items VALUES (171, 'ITM-00171', 'TUTUP GOBLET', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.718909', NULL);
INSERT INTO public.items VALUES (172, 'ITM-00172', 'VIXAL 750ML(12)', 3, 8, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:43.72154', NULL);
INSERT INTO public.items VALUES (173, 'ITM-00173', 'WIJEN', 1, 1, 10.00, 5.00, 37421.00, 'Active', '2026-11-07 20:36:43.723671', NULL);
INSERT INTO public.items VALUES (174, 'ITM-00174', 'INDOCAFE CAPPUCINO', 1, 1, 10.00, 5.00, 3500.00, 'Active', '2026-11-07 20:36:43.7272', NULL);
INSERT INTO public.items VALUES (175, 'ITM-00175', 'MINYAK FILMA', 1, 1, 10.00, 5.00, 21791.00, 'Active', '2026-11-07 20:36:43.730724', NULL);
INSERT INTO public.items VALUES (176, 'ITM-00176', 'LUNCH BOX', 1, 9, 100.00, 30.00, 1650.00, 'Active', '2026-11-07 20:36:43.733146', NULL);
INSERT INTO public.items VALUES (177, 'ITM-00177', 'DUS SNACK MOTIF MANTAP', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.73597', NULL);
INSERT INTO public.items VALUES (178, 'ITM-00178', 'MIKA BENTO', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.738399', NULL);
INSERT INTO public.items VALUES (179, 'ITM-00179', 'KANTONG PUTIH 28', 1, 10, 10.00, 5.00, 16000.00, 'Active', '2026-11-07 20:36:43.741188', NULL);
INSERT INTO public.items VALUES (180, 'ITM-00180', 'KANTONG GAMMA UK 21X39', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.744223', NULL);
INSERT INTO public.items VALUES (181, 'ITM-00181', 'KECAP MANIS INDOFOOD 725', 1, 1, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.747602', NULL);
INSERT INTO public.items VALUES (182, 'ITM-00182', 'TISU LIVI EVO PREMIUM (60)', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:43.750369', NULL);
INSERT INTO public.items VALUES (183, 'ITM-00183', 'KERUPUK BANDUNG', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.752722', NULL);
INSERT INTO public.items VALUES (184, 'ITM-00184', 'CUP CAKE UK 55 MM', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.754608', NULL);
INSERT INTO public.items VALUES (185, 'ITM-00185', 'KOPI SURYA', 1, 1, 10.00, 5.00, 130000.00, 'Active', '2026-11-07 20:36:43.757861', '2027-09-15');
INSERT INTO public.items VALUES (186, 'ITM-00186', 'KOPI JANGKAR', 1, 1, 10.00, 5.00, 115000.00, 'Active', '2026-11-07 20:36:43.760428', NULL);
INSERT INTO public.items VALUES (187, 'ITM-00187', 'DETERGENT BATANGAN KUCING', 3, 1, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:43.762624', NULL);
INSERT INTO public.items VALUES (188, 'ITM-00188', 'PLASTIK BAWANG 80X130X0,06', 1, 1, 20.00, 8.00, 24000.00, 'Active', '2026-11-07 20:36:43.765236', NULL);
INSERT INTO public.items VALUES (189, 'ITM-00189', 'KOTAK PIZZA LAMA', 1, 1, 10.00, 5.00, 3200.00, 'Active', '2026-11-07 20:36:43.768381', NULL);
INSERT INTO public.items VALUES (190, 'ITM-00190', 'TEPUNG AGAR-AGAR', 1, 3, 10.00, 5.00, 4200.00, 'Active', '2026-11-07 20:36:43.77063', NULL);
INSERT INTO public.items VALUES (191, 'ITM-00191', 'MIKA BROWNIES UK.S', 1, 1, 20.00, 8.00, 1800.00, 'Active', '2026-11-07 20:36:43.772879', NULL);
INSERT INTO public.items VALUES (192, 'ITM-00192', 'ABON TUNA', 1, 12, 10.00, 5.00, 35000.00, 'Active', '2026-11-07 20:36:43.775515', NULL);
INSERT INTO public.items VALUES (193, 'ITM-00193', 'ABON AYAM', 1, 3, 10.00, 5.00, 35000.00, 'Active', '2026-11-07 20:36:43.778087', NULL);
INSERT INTO public.items VALUES (194, 'ITM-00194', 'ANCHOR CREAM CHEESE', 1, 1, 10.00, 5.00, 168000.00, 'Active', '2026-11-07 20:36:43.780024', '2027-03-11');
INSERT INTO public.items VALUES (195, 'ITM-00195', 'ALAS GELAS', 1, 1, 10.00, 5.00, 650.00, 'Active', '2026-11-07 20:36:43.782652', NULL);
INSERT INTO public.items VALUES (196, 'ITM-00196', 'ALMOND SICE', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.785525', NULL);
INSERT INTO public.items VALUES (197, 'ITM-00197', 'ALUMINUIM FOIL', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.787931', NULL);
INSERT INTO public.items VALUES (198, 'ITM-00198', 'ASSORTED CHILI PEPPER NANAMI TOGARASHI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.789975', '2027-03-04');
INSERT INTO public.items VALUES (199, 'ITM-00199', 'ASSORTED CHILI PEPPER ICHIMI TOGARASHI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.792141', '2027-06-28');
INSERT INTO public.items VALUES (200, 'ITM-00200', 'BEST FRESH WORPING', 1, 1, 10.00, 5.00, 130000.00, 'Active', '2026-11-07 20:36:43.794978', NULL);
INSERT INTO public.items VALUES (201, 'ITM-00201', 'BIJI KUACI', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.796935', NULL);
INSERT INTO public.items VALUES (202, 'ITM-00202', 'BIJI KUACI THE NUTHOUSE', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.800317', NULL);
INSERT INTO public.items VALUES (203, 'ITM-00203', 'BIJI LABU', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.803521', NULL);
INSERT INTO public.items VALUES (204, 'ITM-00204', 'BIO BIANCA', 1, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:43.80634', '2027-01-16');
INSERT INTO public.items VALUES (205, 'ITM-00205', 'BLUEBAND CAKE COOKIE', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:43.809236', '2027-04-06');
INSERT INTO public.items VALUES (206, 'ITM-00206', 'BLUEBAND SERBAGUNA', 1, 1, 20.00, 8.00, 12500.00, 'Active', '2026-11-07 20:36:43.812133', '2027-03-10');
INSERT INTO public.items VALUES (207, 'ITM-00207', 'BROWNIES SUSHI', 1, 1, 10.00, 5.00, 2200.00, 'Active', '2026-11-07 20:36:43.81454', NULL);
INSERT INTO public.items VALUES (208, 'ITM-00208', 'BUMBU SUSHI SEASONING', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.818014', NULL);
INSERT INTO public.items VALUES (209, 'ITM-00209', 'BUNGA TELANG', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.820381', NULL);
INSERT INTO public.items VALUES (210, 'ITM-00210', 'CEILING LIGHT', 4, 1, 10.00, 5.00, 85000.00, 'Active', '2026-11-07 20:36:43.822431', NULL);
INSERT INTO public.items VALUES (211, 'ITM-00211', 'CHILI PEPPER ICHIMI TOGARASHI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.825412', NULL);
INSERT INTO public.items VALUES (212, 'ITM-00212', 'CHOCOCHIPS JAGUNG/KOMPLEK', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.828824', '2027-04-01');
INSERT INTO public.items VALUES (213, 'ITM-00213', 'CHOCOCHIPS SIMBA', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.831452', '2027-02-08');
INSERT INTO public.items VALUES (214, 'ITM-00214', 'CHRISTA TUNA', 1, 12, 10.00, 5.00, 32000.00, 'Active', '2026-11-07 20:36:43.834262', '2027-07-17');
INSERT INTO public.items VALUES (215, 'ITM-00215', 'COKLAT BUBUK BENSDROP', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.836546', NULL);
INSERT INTO public.items VALUES (216, 'ITM-00216', 'COLLATA CHOCO CHIP', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.838206', NULL);
INSERT INTO public.items VALUES (217, 'ITM-00217', 'COLLATA DARK', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.8399', '2028-03-29');
INSERT INTO public.items VALUES (218, 'ITM-00218', 'COLLATA WHITE', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.84284', '2027-03-20');
INSERT INTO public.items VALUES (219, 'ITM-00219', 'CORN FLAKES 500 G', 1, 12, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:43.84544', NULL);
INSERT INTO public.items VALUES (220, 'ITM-00220', 'CORNICHE WHITE', 1, 12, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.847548', NULL);
INSERT INTO public.items VALUES (221, 'ITM-00221', 'CRYSTAL ALMOND', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.850622', NULL);
INSERT INTO public.items VALUES (222, 'ITM-00222', 'DANCOW', 1, 1, 10.00, 5.00, 16500.00, 'Active', '2026-11-07 20:36:43.853063', '2027-12-01');
INSERT INTO public.items VALUES (223, 'ITM-00223', 'DEL MONTE SAUS TOMAT SACHET', 1, 11, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.855672', NULL);
INSERT INTO public.items VALUES (224, 'ITM-00224', 'DEL MONTE XTRA HOT SACHET', 1, 11, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.858156', NULL);
INSERT INTO public.items VALUES (225, 'ITM-00225', 'DELMONTE SAUS SAMBAL SACHET', 1, 11, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:43.861109', NULL);
INSERT INTO public.items VALUES (226, 'ITM-00226', 'DIMSUM ROUND 32 CM', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.863623', NULL);
INSERT INTO public.items VALUES (227, 'ITM-00227', 'DIRECT THREMAL LABEL', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.86612', NULL);
INSERT INTO public.items VALUES (228, 'ITM-00228', 'DRIED CUT WAKAME', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.868022', '2027-10-13');
INSERT INTO public.items VALUES (229, 'ITM-00229', 'ENACHAN MISO PUTIH', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.869767', '2027-03-26');
INSERT INTO public.items VALUES (230, 'ITM-00230', 'EVAPORATED MILK SUNBAY', 1, 1, 10.00, 5.00, 12211.00, 'Active', '2026-11-07 20:36:43.871377', '2027-04-14');
INSERT INTO public.items VALUES (231, 'ITM-00231', 'LA FONTE FETTUCINE', 1, 1, 10.00, 5.00, 22500.00, 'Active', '2026-11-07 20:36:43.873003', NULL);
INSERT INTO public.items VALUES (232, 'ITM-00232', 'FIGARO ACAR KAPERS', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.874601', NULL);
INSERT INTO public.items VALUES (233, 'ITM-00233', 'FILTER BAG ONE TWO CUPS', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.87612', NULL);
INSERT INTO public.items VALUES (234, 'ITM-00234', 'FILTER KOPI ONE TWO CUPS 7 RH X 1LBR', 1, 8, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.878509', NULL);
INSERT INTO public.items VALUES (235, 'ITM-00235', 'FOOD CONTAINER 1000ML', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.880259', NULL);
INSERT INTO public.items VALUES (236, 'ITM-00236', 'FOOD CONTAINER SQUARE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.881932', NULL);
INSERT INTO public.items VALUES (237, 'ITM-00237', 'FRUCTUS LYCII 100G', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.883487', NULL);
INSERT INTO public.items VALUES (238, 'ITM-00238', 'FRUTANEIRA LYCHEE', 1, 1, 10.00, 5.00, 32000.00, 'Active', '2026-11-07 20:36:43.885063', '2027-06-25');
INSERT INTO public.items VALUES (239, 'ITM-00239', 'GARPU PLASTIK BESAR', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.888793', NULL);
INSERT INTO public.items VALUES (240, 'ITM-00240', 'GARPU PLASTIK BUAH', 1, 1, 10.00, 5.00, 7000.00, 'Active', '2026-11-07 20:36:43.891551', NULL);
INSERT INTO public.items VALUES (241, 'ITM-00241', 'GELAS 12 OZ', 1, 1, 10.00, 5.00, 650.00, 'Active', '2026-11-07 20:36:43.89331', NULL);
INSERT INTO public.items VALUES (242, 'ITM-00242', 'GELAS 14 OZ', 1, 1, 10.00, 5.00, 650.00, 'Active', '2026-11-07 20:36:43.895657', NULL);
INSERT INTO public.items VALUES (243, 'ITM-00243', 'GELAS LOGO DANGAU', 1, 1, 10.00, 5.00, 650.00, 'Active', '2026-11-07 20:36:43.897221', NULL);
INSERT INTO public.items VALUES (244, 'ITM-00244', 'GELATINE 500GR', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.898701', NULL);
INSERT INTO public.items VALUES (245, 'ITM-00245', 'GLOBAL MUSHROOM', 1, 12, 20.00, 8.00, 15833.00, 'Active', '2026-11-07 20:36:43.90015', '2028-05-06');
INSERT INTO public.items VALUES (246, 'ITM-00246', 'GULA MERAH (PALM SUGAR)', 1, 3, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.901884', '2024-11-16');
INSERT INTO public.items VALUES (247, 'ITM-00247', 'GULARE', 1, 1, 10.00, 5.00, 324.00, 'Active', '2026-11-07 20:36:43.904106', NULL);
INSERT INTO public.items VALUES (248, 'ITM-00248', 'GULA HALUS (GULUS)', 1, 1, 10.00, 5.00, 11650.00, 'Active', '2026-11-07 20:36:43.90577', '2028-03-06');
INSERT INTO public.items VALUES (249, 'ITM-00249', 'HEINZ PASTE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.907292', '2027-10-14');
INSERT INTO public.items VALUES (250, 'ITM-00250', 'HI GAS', 1, 12, 10.00, 5.00, 19900.00, 'Active', '2026-11-07 20:36:43.908801', NULL);
INSERT INTO public.items VALUES (251, 'ITM-00251', 'HONDASHI SUSHI', 1, 1, 10.00, 5.00, 42000.00, 'Active', '2026-11-07 20:36:43.910749', NULL);
INSERT INTO public.items VALUES (252, 'ITM-00252', 'I PELATI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.912876', '2028-12-31');
INSERT INTO public.items VALUES (253, 'ITM-00253', 'JAGUNG HALUS', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.91462', '2028-12-09');
INSERT INTO public.items VALUES (254, 'ITM-00254', 'JAGUNG KASAR', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.916107', '2028-11-24');
INSERT INTO public.items VALUES (255, 'ITM-00255', 'JAPONICA 10KG', 1, 3, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.917509', NULL);
INSERT INTO public.items VALUES (256, 'ITM-00256', 'JUICE JUNGLE GUAVA', 1, 1, 10.00, 5.00, 28083.00, 'Active', '2026-11-07 20:36:43.918876', NULL);
INSERT INTO public.items VALUES (257, 'ITM-00257', 'JUICE JUNGLE ORANGE', 1, 1, 10.00, 5.00, 28083.00, 'Active', '2026-11-07 20:36:43.921366', '2027-05-11');
INSERT INTO public.items VALUES (258, 'ITM-00258', 'JUICE JUNGLE LEMON', 1, 1, 10.00, 5.00, 28083.00, 'Active', '2026-11-07 20:36:43.923754', '2027-07-01');
INSERT INTO public.items VALUES (259, 'ITM-00259', 'JUICE JUNGLE PINEAPPLE', 1, 1, 10.00, 5.00, 28083.00, 'Active', '2026-11-07 20:36:43.925675', NULL);
INSERT INTO public.items VALUES (260, 'ITM-00260', 'JERUK NIPIS KERING', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.927324', '2025-01-08');
INSERT INTO public.items VALUES (261, 'ITM-00261', 'KACANG HIJAU YU AI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.928822', NULL);
INSERT INTO public.items VALUES (262, 'ITM-00262', 'KACANG MERAH YU AI', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:43.930755', NULL);
INSERT INTO public.items VALUES (263, 'ITM-00263', 'KACANG METE', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:43.934191', '2027-03-22');
INSERT INTO public.items VALUES (264, 'ITM-00264', 'KANTONG 120X100', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.937033', NULL);
INSERT INTO public.items VALUES (265, 'ITM-00265', 'KANTONG 15 X 30', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.938938', NULL);
INSERT INTO public.items VALUES (266, 'ITM-00266', 'KANTONG 40X50', 1, 10, 20.00, 8.00, 12000.00, 'Active', '2026-11-07 20:36:43.941099', NULL);
INSERT INTO public.items VALUES (267, 'ITM-00267', 'KANTONG 40X60', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.943724', NULL);
INSERT INTO public.items VALUES (268, 'ITM-00268', 'KANTONG 50X75', 1, 10, 20.00, 8.00, 12000.00, 'Active', '2026-11-07 20:36:43.946498', NULL);
INSERT INTO public.items VALUES (269, 'ITM-00269', 'KANTONG 80 X 100', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.948903', NULL);
INSERT INTO public.items VALUES (270, 'ITM-00270', 'KANTONG 90 X 120', 1, 10, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:43.951382', NULL);
INSERT INTO public.items VALUES (271, 'ITM-00271', 'KANTONG KAIN PANAS', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.953771', NULL);
INSERT INTO public.items VALUES (272, 'ITM-00272', 'KANTONG P SUSU UK 28', 1, 10, 10.00, 5.00, 16000.00, 'Active', '2026-11-07 20:36:43.956286', NULL);
INSERT INTO public.items VALUES (273, 'ITM-00273', 'KANTONG UK 40', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.959203', NULL);
INSERT INTO public.items VALUES (274, 'ITM-00274', 'KANTONG UK 50', 1, 10, 10.00, 5.00, 30000.00, 'Active', '2026-11-07 20:36:43.962268', NULL);
INSERT INTO public.items VALUES (275, 'ITM-00275', 'KARI HOUSE JEPANG', 1, 1, 10.00, 5.00, 163501.00, 'Active', '2026-11-07 20:36:43.9648', '2027-11-07');
INSERT INTO public.items VALUES (276, 'ITM-00276', 'KATSUODASHI', 1, 1, 10.00, 5.00, 42000.00, 'Active', '2026-11-07 20:36:43.967244', '2025-04-01');
INSERT INTO public.items VALUES (277, 'ITM-00277', 'KECAP BANGO', 1, 1, 10.00, 5.00, 22000.00, 'Active', '2026-11-07 20:36:43.969671', '2027-05-29');
INSERT INTO public.items VALUES (278, 'ITM-00278', 'KECAP BULLDOG', 1, 1, 10.00, 5.00, 22000.00, 'Active', '2026-11-07 20:36:43.972385', '2028-01-18');
INSERT INTO public.items VALUES (279, 'ITM-00279', 'KECAP MAGGIE', 1, 1, 10.00, 5.00, 22000.00, 'Active', '2026-11-07 20:36:43.975393', '2026-11-18');
INSERT INTO public.items VALUES (280, 'ITM-00280', 'KERANJANG PLASTIK KAHYANGAN', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:43.978216', NULL);
INSERT INTO public.items VALUES (281, 'ITM-00281', 'KERTAS BAKPAO UK 5 (500)', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.980722', NULL);
INSERT INTO public.items VALUES (282, 'ITM-00282', 'KERTAS BAKPAO UK 7 CM', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.983822', NULL);
INSERT INTO public.items VALUES (283, 'ITM-00283', 'KERTAS BAKPAU UK 6.0 (500)', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.987005', NULL);
INSERT INTO public.items VALUES (284, 'ITM-00284', 'KERTAS DIMSUM', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.989735', NULL);
INSERT INTO public.items VALUES (285, 'ITM-00285', 'KERTAS DIMSUM UK 4.5', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:43.992412', NULL);
INSERT INTO public.items VALUES (286, 'ITM-00286', 'KERTAS FILTER KOPI 01', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.99525', NULL);
INSERT INTO public.items VALUES (287, 'ITM-00287', 'KERTAS FILTER KOPI 02', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:43.997811', NULL);
INSERT INTO public.items VALUES (288, 'ITM-00288', 'KIKKOMAN KECAP ASIN', 1, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:44.000337', NULL);
INSERT INTO public.items VALUES (289, 'ITM-00289', 'KIKKOMAN SAUS MANIS', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.002932', '2026-11-14');
INSERT INTO public.items VALUES (290, 'ITM-00290', 'KIKKOMAN SAUS PEDAS/GOCUJANG', 1, 1, 10.00, 5.00, 48000.00, 'Active', '2026-11-07 20:36:44.005686', '2027-04-30');
INSERT INTO public.items VALUES (291, 'ITM-00291', 'KIKKOMAN YAKINIKU', 1, 1, 10.00, 5.00, 52000.00, 'Active', '2026-11-07 20:36:44.008535', NULL);
INSERT INTO public.items VALUES (292, 'ITM-00292', 'KNORR BEEF', 1, 1, 10.00, 5.00, 92000.00, 'Active', '2026-11-07 20:36:44.011155', '2027-05-29');
INSERT INTO public.items VALUES (293, 'ITM-00293', 'KNORR CHICKEN POWDER', 1, 1, 10.00, 5.00, 90100.00, 'Active', '2026-11-07 20:36:44.013782', '2027-05-11');
INSERT INTO public.items VALUES (294, 'ITM-00294', 'KNORR DEMI GLACE', 1, 1, 10.00, 5.00, 98000.00, 'Active', '2026-11-07 20:36:44.016376', '2027-02-07');
INSERT INTO public.items VALUES (295, 'ITM-00295', 'KOEPOE BAKING SODA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.01926', NULL);
INSERT INTO public.items VALUES (296, 'ITM-00296', 'KOEPOE HIJAU MUDA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.022169', '2030-06-13');
INSERT INTO public.items VALUES (297, 'ITM-00297', 'KOEPOE HIJAU TUA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.024689', '2030-10-28');
INSERT INTO public.items VALUES (298, 'ITM-00298', 'KOEPOE MERAH TUA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.027297', NULL);
INSERT INTO public.items VALUES (299, 'ITM-00299', 'KOEPOE PERISA VANILLA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.030005', '2028-12-08');
INSERT INTO public.items VALUES (300, 'ITM-00300', 'KOEPOE SODA KUE', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.032792', '2027-11-19');
INSERT INTO public.items VALUES (301, 'ITM-00301', 'KOPI', 1, 1, 10.00, 5.00, 150000.00, 'Active', '2026-11-07 20:36:44.035632', NULL);
INSERT INTO public.items VALUES (302, 'ITM-00302', 'KUNCI HOTEL DANGAU', 2, 1, 10.00, 5.00, 5000.00, 'Active', '2026-11-07 20:36:44.038687', NULL);
INSERT INTO public.items VALUES (303, 'ITM-00303', 'KWEPIE MAYO', 1, 1, 10.00, 5.00, 97000.00, 'Active', '2026-11-07 20:36:44.041405', '2026-12-17');
INSERT INTO public.items VALUES (304, 'ITM-00304', 'LAMPION PUTIH', 4, 1, 10.00, 5.00, 35000.00, 'Active', '2026-11-07 20:36:44.04416', NULL);
INSERT INTO public.items VALUES (305, 'ITM-00305', 'LEE KUM KEE 770 G', 1, 1, 10.00, 5.00, 56667.00, 'Active', '2026-11-07 20:36:44.046852', NULL);
INSERT INTO public.items VALUES (306, 'ITM-00306', 'LEE KUM KEE GRATIS (KECIL)', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:44.049531', '2028-01-01');
INSERT INTO public.items VALUES (307, 'ITM-00307', 'LIME INFUSED WATER', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.052296', NULL);
INSERT INTO public.items VALUES (308, 'ITM-00308', 'MAIZENA 150 g', 1, 1, 20.00, 8.00, 7500.00, 'Active', '2026-11-07 20:36:44.054586', '2027-12-01');
INSERT INTO public.items VALUES (309, 'ITM-00309', 'MAMASUKA MAYO', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.057811', '2027-06-30');
INSERT INTO public.items VALUES (310, 'ITM-00310', 'MARSHMALLOW', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.06055', '2027-09-08');
INSERT INTO public.items VALUES (311, 'ITM-00311', 'MATCHA LATTE NO SUGAR', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.063167', NULL);
INSERT INTO public.items VALUES (312, 'ITM-00312', 'MAYONAISE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.065822', '2026-10-04');
INSERT INTO public.items VALUES (313, 'ITM-00313', 'MENTAIKKO SAUCE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.068535', NULL);
INSERT INTO public.items VALUES (314, 'ITM-00314', 'MINYAK WIJEN YO GUAN HENG', 1, 1, 10.00, 5.00, 37421.00, 'Active', '2026-11-07 20:36:44.071238', '2028-05-01');
INSERT INTO public.items VALUES (315, 'ITM-00315', 'MIZKAN', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.073676', '2026-11-01');
INSERT INTO public.items VALUES (316, 'ITM-00316', 'MUSTARD', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.076066', NULL);
INSERT INTO public.items VALUES (317, 'ITM-00317', 'NAME CARD CASE', 5, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.078404', NULL);
INSERT INTO public.items VALUES (318, 'ITM-00318', 'NORI', 1, 1, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:44.080711', '2028-02-19');
INSERT INTO public.items VALUES (319, 'ITM-00319', 'NUTTELA', 1, 1, 10.00, 5.00, 71817.00, 'Active', '2026-11-07 20:36:44.083011', '2027-07-16');
INSERT INTO public.items VALUES (320, 'ITM-00320', 'OREO COOKIE CRUMB', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.08588', NULL);
INSERT INTO public.items VALUES (321, 'ITM-00321', 'OREO ORIGINAL', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.088336', '2026-11-29');
INSERT INTO public.items VALUES (322, 'ITM-00322', 'PAPER CUP', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.090932', NULL);
INSERT INTO public.items VALUES (323, 'ITM-00323', 'PARSLEY', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.093312', NULL);
INSERT INTO public.items VALUES (324, 'ITM-00324', 'PEMBERSIH CLOSET', 3, 1, 10.00, 5.00, 24000.00, 'Active', '2026-11-07 20:36:44.095667', NULL);
INSERT INTO public.items VALUES (325, 'ITM-00325', 'PENNE', 1, 1, 10.00, 5.00, 26327.00, 'Active', '2026-11-07 20:36:44.097959', NULL);
INSERT INTO public.items VALUES (326, 'ITM-00326', 'PERISA VANILA', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.100277', '2028-08-01');
INSERT INTO public.items VALUES (327, 'ITM-00327', 'PIRING EMAS', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.103487', NULL);
INSERT INTO public.items VALUES (328, 'ITM-00328', 'PLASTIK BENING', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.10602', NULL);
INSERT INTO public.items VALUES (329, 'ITM-00329', 'PLEDGE SACHET', 3, 11, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:44.108448', NULL);
INSERT INTO public.items VALUES (330, 'ITM-00330', 'POYRAZ OLIVE OIL', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.11095', NULL);
INSERT INTO public.items VALUES (331, 'ITM-00331', 'SALF INSTANT', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.113442', '2027-11-06');
INSERT INTO public.items VALUES (332, 'ITM-00332', 'SAN REMO MACARONI', 1, 1, 10.00, 5.00, 26327.00, 'Active', '2026-11-07 20:36:44.11581', '2028-04-03');
INSERT INTO public.items VALUES (333, 'ITM-00333', 'SAN REMON FUSILI', 1, 1, 10.00, 5.00, 26327.00, 'Active', '2026-11-07 20:36:44.118518', NULL);
INSERT INTO public.items VALUES (334, 'ITM-00334', 'SAN REMON FETUCINE', 1, 1, 10.00, 5.00, 25550.00, 'Active', '2026-11-07 20:36:44.120913', NULL);
INSERT INTO public.items VALUES (335, 'ITM-00335', 'SAN REMO SPAGHETTI', 1, 1, 10.00, 5.00, 25550.00, 'Active', '2026-11-07 20:36:44.123205', '2028-05-10');
INSERT INTO public.items VALUES (336, 'ITM-00336', 'SANTAN KARA', 1, 1, 10.00, 5.00, 3800.00, 'Active', '2026-11-07 20:36:44.126093', '2027-07-12');
INSERT INTO public.items VALUES (337, 'ITM-00337', 'SAOS BBQ', 1, 1, 10.00, 5.00, 32967.00, 'Active', '2026-11-07 20:36:44.128471', '2028-01-31');
INSERT INTO public.items VALUES (338, 'ITM-00338', 'SARUNG TANGAN', 1, 1, 20.00, 8.00, 15000.00, 'Active', '2026-11-07 20:36:44.130911', NULL);
INSERT INTO public.items VALUES (339, 'ITM-00339', 'SATAY PASTE 200GR', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.133861', NULL);
INSERT INTO public.items VALUES (340, 'ITM-00340', 'SAUS HOISIN', 1, 1, 10.00, 5.00, 18500.00, 'Active', '2026-11-07 20:36:44.140773', '2027-03-21');
INSERT INTO public.items VALUES (341, 'ITM-00341', 'SEAL CUP', 1, 7, 10.00, 5.00, 115000.00, 'Active', '2026-11-07 20:36:44.146451', NULL);
INSERT INTO public.items VALUES (342, 'ITM-00342', 'SEAWEED', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.149284', '2028-02-19');
INSERT INTO public.items VALUES (343, 'ITM-00343', 'SEDOTAN HITAM /STRAW', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.15274', NULL);
INSERT INTO public.items VALUES (344, 'ITM-00344', 'SENCHA GREENTEA', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.155321', '2024-11-10');
INSERT INTO public.items VALUES (345, 'ITM-00345', 'SENDOK GARPU', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.159565', NULL);
INSERT INTO public.items VALUES (346, 'ITM-00346', 'SENDOK JELLY VICTORY', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.163113', NULL);
INSERT INTO public.items VALUES (347, 'ITM-00347', 'SENDOK JELLY', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.166622', NULL);
INSERT INTO public.items VALUES (348, 'ITM-00348', 'SENDOK PLASTIK', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.17195', NULL);
INSERT INTO public.items VALUES (349, 'ITM-00349', 'SPONS (isi 3)', 3, 1, 10.00, 5.00, 4500.00, 'Active', '2026-11-07 20:36:44.175559', NULL);
INSERT INTO public.items VALUES (350, 'ITM-00350', 'SRIRACHA', 1, 1, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:44.180722', '2027-12-03');
INSERT INTO public.items VALUES (351, 'ITM-00351', 'STABILIZER', 4, 1, 10.00, 5.00, 285000.00, 'Active', '2026-11-07 20:36:44.184925', NULL);
INSERT INTO public.items VALUES (352, 'ITM-00352', 'SUSU COKLAT FRISAN FLAG KEMASAN', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.188535', '2027-05-01');
INSERT INTO public.items VALUES (353, 'ITM-00353', 'SUSU COKLAT FRISAN FLAG KALENG', 1, 12, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.192734', NULL);
INSERT INTO public.items VALUES (354, 'ITM-00354', 'SUSU UHT', 1, 1, 20.00, 8.00, 17547.00, 'Active', '2026-11-07 20:36:44.199426', '2027-08-13');
INSERT INTO public.items VALUES (355, 'ITM-00355', 'TABASCO', 1, 1, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:44.20333', NULL);
INSERT INTO public.items VALUES (356, 'ITM-00356', 'TAF BOTOL KUNING', 1, 8, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.208315', '2028-10-01');
INSERT INTO public.items VALUES (357, 'ITM-00357', 'TAFFHOME LIS PENGHALANG SERANGGA', 4, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.215523', NULL);
INSERT INTO public.items VALUES (358, 'ITM-00358', 'TAKUMI RAMEN SOUP SHOYU', 1, 1, 10.00, 5.00, 42000.00, 'Active', '2026-11-07 20:36:44.219464', '2026-09-17');
INSERT INTO public.items VALUES (359, 'ITM-00359', 'TAS PLSTIK LIVINA', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.224187', NULL);
INSERT INTO public.items VALUES (360, 'ITM-00360', 'TEA HEAVEN', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.230001', '2026-11-01');
INSERT INTO public.items VALUES (361, 'ITM-00361', 'TEH BUTTERFLY PEA BLUE', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.233707', '2026-10-30');
INSERT INTO public.items VALUES (362, 'ITM-00362', 'TEH NATURAL MATERIAL', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.236632', NULL);
INSERT INTO public.items VALUES (363, 'ITM-00363', 'TEH SUSU (SERBUK TEH 82)', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.240791', '2028-12-31');
INSERT INTO public.items VALUES (364, 'ITM-00364', 'TEH UNGU', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.245105', '2025-11-01');
INSERT INTO public.items VALUES (365, 'ITM-00365', 'TELUR', 1, 1, 20.00, 8.00, 2200.00, 'Active', '2026-11-07 20:36:44.250185', NULL);
INSERT INTO public.items VALUES (366, 'ITM-00366', 'TELUR KAMPUNG', 1, 1, 20.00, 8.00, 3000.00, 'Active', '2026-11-07 20:36:44.253565', NULL);
INSERT INTO public.items VALUES (367, 'ITM-00367', 'TEPUNG BERAS', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.257548', '2028-05-19');
INSERT INTO public.items VALUES (368, 'ITM-00368', 'TEPUNG KARAGE', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.261304', NULL);
INSERT INTO public.items VALUES (369, 'ITM-00369', 'TEPUNG KETAN HITAM', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.264639', '2027-02-20');
INSERT INTO public.items VALUES (370, 'ITM-00370', 'TEPUNG KUNCI BIRU 1KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.267616', NULL);
INSERT INTO public.items VALUES (371, 'ITM-00371', 'TEPUNG LIFE (1,5) KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.270344', NULL);
INSERT INTO public.items VALUES (372, 'ITM-00372', 'TEPUNG LIFE 1KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.273', '2027-05-01');
INSERT INTO public.items VALUES (373, 'ITM-00373', 'TEPUNG POTATO', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.275579', NULL);
INSERT INTO public.items VALUES (374, 'ITM-00374', 'TEPUNG ROTI 500 G', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.278389', NULL);
INSERT INTO public.items VALUES (375, 'ITM-00375', 'TEPUNG TANG MIEN 1,5 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.280925', NULL);
INSERT INTO public.items VALUES (376, 'ITM-00376', 'TEPUNG TAPIOKA', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.283289', '2027-11-01');
INSERT INTO public.items VALUES (377, 'ITM-00377', 'TEPUNG TEMPURA', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.285811', '2026-09-11');
INSERT INTO public.items VALUES (378, 'ITM-00378', 'TEPUNG CAKRA 1,5 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.289641', NULL);
INSERT INTO public.items VALUES (379, 'ITM-00379', 'TEPUNG CAKRA 1 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.292696', NULL);
INSERT INTO public.items VALUES (380, 'ITM-00380', 'TEPUNG TERIGU 1,5 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.295875', NULL);
INSERT INTO public.items VALUES (381, 'ITM-00381', 'TEPUNG FALCON 1 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.298381', NULL);
INSERT INTO public.items VALUES (382, 'ITM-00382', 'THINWALL 20ML', 1, 1, 10.00, 5.00, 850.00, 'Active', '2026-11-07 20:36:44.300714', NULL);
INSERT INTO public.items VALUES (383, 'ITM-00383', 'THINWALL 25ML ISI 50', 1, 1, 10.00, 5.00, 850.00, 'Active', '2026-11-07 20:36:44.303245', NULL);
INSERT INTO public.items VALUES (384, 'ITM-00384', 'THINWALL 150 ML (ISI 25)', 1, 1, 10.00, 5.00, 1900.00, 'Active', '2026-11-07 20:36:44.306945', NULL);
INSERT INTO public.items VALUES (385, 'ITM-00385', 'THINWALL 750 ML', 1, 1, 10.00, 5.00, 2800.00, 'Active', '2026-11-07 20:36:44.310545', NULL);
INSERT INTO public.items VALUES (386, 'ITM-00386', 'THINWALL 1000ML', 1, 1, 10.00, 5.00, 3200.00, 'Active', '2026-11-07 20:36:44.313322', NULL);
INSERT INTO public.items VALUES (387, 'ITM-00387', 'THINWALL 400 (ISI 25)', 1, 1, 10.00, 5.00, 1900.00, 'Active', '2026-11-07 20:36:44.315786', NULL);
INSERT INTO public.items VALUES (388, 'ITM-00388', 'THREES SHEEP', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.318617', NULL);
INSERT INTO public.items VALUES (389, 'ITM-00389', 'TOBASIO', 1, 1, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:44.321656', NULL);
INSERT INTO public.items VALUES (390, 'ITM-00390', 'TOEFIECO TALAS', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.324696', '2027-08-07');
INSERT INTO public.items VALUES (391, 'ITM-00391', 'TOFFIECO COKLAT', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.32773', '2026-02-16');
INSERT INTO public.items VALUES (392, 'ITM-00392', 'TOKUYO TONKATSU', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.330294', NULL);
INSERT INTO public.items VALUES (393, 'ITM-00393', 'TTS MUSCHROOM', 1, 1, 10.00, 5.00, 14827.00, 'Active', '2026-11-07 20:36:44.333086', '2028-07-25');
INSERT INTO public.items VALUES (394, 'ITM-00394', 'TUNA KING FISHER', 1, 12, 10.00, 5.00, 38000.00, 'Active', '2026-11-07 20:36:44.336184', '2028-11-06');
INSERT INTO public.items VALUES (395, 'ITM-00395', 'VAN HOUTEN COKLAT BUBUK', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.339299', NULL);
INSERT INTO public.items VALUES (396, 'ITM-00396', 'VIRGIN OIL SUKA', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.343121', NULL);
INSERT INTO public.items VALUES (397, 'ITM-00397', 'WIJEN HITAM', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.34626', NULL);
INSERT INTO public.items VALUES (398, 'ITM-00398', 'WIJEN PUTIH', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.349116', NULL);
INSERT INTO public.items VALUES (399, 'ITM-00399', 'WRAPPING BESAR', 1, 7, 10.00, 5.00, 165000.00, 'Active', '2026-11-07 20:36:44.351481', NULL);
INSERT INTO public.items VALUES (400, 'ITM-00400', 'WRAPPING KECIL', 1, 7, 10.00, 5.00, 130000.00, 'Active', '2026-11-07 20:36:44.354129', NULL);
INSERT INTO public.items VALUES (401, 'ITM-00401', 'WASABI POWDER', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.356497', NULL);
INSERT INTO public.items VALUES (402, 'ITM-00402', 'YELLOW MUSTRAD', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.358826', '2027-05-09');
INSERT INTO public.items VALUES (403, 'ITM-00403', 'ZODA SODA WATER', 1, 8, 10.00, 5.00, 4750.00, 'Active', '2026-11-07 20:36:44.361504', NULL);
INSERT INTO public.items VALUES (404, 'ITM-00404', 'BIJI KACANG HIJAU', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.363827', '2026-11-06');
INSERT INTO public.items VALUES (405, 'ITM-00405', 'EXTRA VIRGIN OLIVE OIL', 1, 1, 10.00, 5.00, 188700.00, 'Active', '2026-11-07 20:36:44.366408', '2027-12-02');
INSERT INTO public.items VALUES (406, 'ITM-00406', 'SEDOTAN BENGKOK KERTAS  5 mmX24 cm', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.369728', NULL);
INSERT INTO public.items VALUES (407, 'ITM-00407', 'BRONIES M', 1, 1, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:44.372803', NULL);
INSERT INTO public.items VALUES (408, 'ITM-00408', 'BROWNIES L', 1, 1, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:44.37587', '2026-11-18');
INSERT INTO public.items VALUES (409, 'ITM-00409', 'BROWNIES S', 1, 1, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:44.379081', NULL);
INSERT INTO public.items VALUES (410, 'ITM-00410', 'KHARISMA UK 6X18', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.382186', NULL);
INSERT INTO public.items VALUES (411, 'ITM-00411', 'SEDOTAN HITAM SKSS', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.385112', NULL);
INSERT INTO public.items VALUES (412, 'ITM-00412', 'BENTO LU', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.387496', NULL);
INSERT INTO public.items VALUES (413, 'ITM-00413', 'LIBRA PACK FOOD BOX CONTAINER', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.389982', NULL);
INSERT INTO public.items VALUES (414, 'ITM-00414', 'V60 COFFEE PAPER FILTER FILTER 1-2 CUPS', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:44.391973', NULL);
INSERT INTO public.items VALUES (415, 'ITM-00415', 'V60 COFFEE PAPER FILTER 2-4 CUPS VO2', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:44.393583', NULL);
INSERT INTO public.items VALUES (416, 'ITM-00416', 'V60 COFFEE PAPER FILTER 2-4 CUPS', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:44.395046', NULL);
INSERT INTO public.items VALUES (417, 'ITM-00417', 'COFFEE PAPER FILTER 1-2 CUPS KOTAK HITAM', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.396467', NULL);
INSERT INTO public.items VALUES (418, 'ITM-00418', 'VESPER COFFEE PAPER FILTER 1-2 CUPS V60', 1, 1, 10.00, 5.00, 28000.00, 'Active', '2026-11-07 20:36:44.397933', NULL);
INSERT INTO public.items VALUES (419, 'ITM-00419', 'LUSTER DUST SILVER 33449', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.399347', NULL);
INSERT INTO public.items VALUES (420, 'ITM-00420', 'LUSTER DUST GOLD 33449', 1, 9, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.402177', NULL);
INSERT INTO public.items VALUES (421, 'ITM-00421', 'TOFFIECO RED VELVET', 1, 1, 10.00, 5.00, 48000.00, 'Active', '2026-11-07 20:36:44.404813', '2028-05-18');
INSERT INTO public.items VALUES (422, 'ITM-00422', 'ONE TWO CUPS 7RHAPGTP', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.406599', NULL);
INSERT INTO public.items VALUES (423, 'ITM-00423', 'ONE TWO CUPS 6X8 CM', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.408488', NULL);
INSERT INTO public.items VALUES (424, 'ITM-00424', 'ROL PLASTIK PENUTUP GELAS DANGAU', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.409975', NULL);
INSERT INTO public.items VALUES (425, 'ITM-00425', 'KERTAS BAKPAU 9X6,5 CM', 1, 1, 10.00, 5.00, 18000.00, 'Active', '2026-11-07 20:36:44.411384', NULL);
INSERT INTO public.items VALUES (426, 'ITM-00426', 'NATURAL MATERIAL', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.412767', NULL);
INSERT INTO public.items VALUES (427, 'ITM-00427', 'SENDOK BEBEK', 1, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.414198', NULL);
INSERT INTO public.items VALUES (428, 'ITM-00428', 'PIRING KERTAS EMAS', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.416102', NULL);
INSERT INTO public.items VALUES (429, 'ITM-00429', 'TEPUNG POTATO STARCH 1 KG', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.418392', NULL);
INSERT INTO public.items VALUES (430, 'ITM-00430', 'TEPUNG KETAN PUTIH', 1, 3, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.420109', NULL);
INSERT INTO public.items VALUES (431, 'ITM-00431', 'SAN REMO PENNE', 1, 1, 10.00, 5.00, 26327.00, 'Active', '2026-11-07 20:36:44.421582', NULL);
INSERT INTO public.items VALUES (432, 'ITM-00432', 'SAN REMO FETTUCCINE', 1, 1, 10.00, 5.00, 25550.00, 'Active', '2026-11-07 20:36:44.423093', NULL);
INSERT INTO public.items VALUES (433, 'ITM-00433', 'PLEDGE FURNITURE POLISH BOTOL 330 G', 3, 8, 10.00, 5.00, 25000.00, 'Active', '2026-11-07 20:36:44.424547', NULL);
INSERT INTO public.items VALUES (434, 'ITM-00434', 'KRISBOW MOP', 3, 1, 10.00, 5.00, 55000.00, 'Active', '2026-11-07 20:36:44.426039', NULL);
INSERT INTO public.items VALUES (435, 'ITM-00435', 'LOXUS CLEANER', 3, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:44.427446', NULL);
INSERT INTO public.items VALUES (436, 'ITM-00436', 'PRO CLEAN MAGIC BLOCK', 3, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.428997', NULL);
INSERT INTO public.items VALUES (437, 'ITM-00437', 'PRO CLEAN MAGIC SPONGE', 3, 1, 10.00, 5.00, 14000.00, 'Active', '2026-11-07 20:36:44.432921', NULL);
INSERT INTO public.items VALUES (438, 'ITM-00438', 'BENSDORP', 1, 1, 10.00, 5.00, 15000.00, 'Active', '2026-11-07 20:36:44.435974', NULL);
INSERT INTO public.items VALUES (439, 'ITM-00439', 'KORAN', 5, 1, 40.00, 15.00, 15000.00, 'Active', '2026-11-07 20:36:44.437915', NULL);
INSERT INTO public.items VALUES (440, 'ITM-00440', 'BOTOL BODY SOAP', 2, 8, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:44.439406', NULL);
INSERT INTO public.items VALUES (441, 'ITM-00441', 'BOTOL SHAMPOO', 2, 8, 10.00, 5.00, 1800.00, 'Active', '2026-11-07 20:36:44.441821', NULL);
INSERT INTO public.items VALUES (442, 'ITM-00442', 'MR SENDOK GARPU PLASTIK', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.444659', NULL);
INSERT INTO public.items VALUES (443, 'ITM-00443', 'KCS GARPU PLASTIK', 1, 1, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.446408', NULL);
INSERT INTO public.items VALUES (444, 'ITM-00444', 'PENCETAK PIZZA', 4, 1, 10.00, 5.00, 65000.00, 'Active', '2026-11-07 20:36:44.448248', NULL);
INSERT INTO public.items VALUES (445, 'ITM-00445', 'WRAPING UKURAN 40X500', 1, 7, 10.00, 5.00, 165000.00, 'Active', '2026-11-07 20:36:44.450948', NULL);
INSERT INTO public.items VALUES (446, 'ITM-00446', 'MAG CHEESE', 1, 1, 10.00, 5.00, 145000.00, 'Active', '2026-11-07 20:36:44.452997', '2027-02-01');
INSERT INTO public.items VALUES (447, 'ITM-00447', 'MEISES COKLAT', 1, 1, 10.00, 5.00, 45000.00, 'Active', '2026-11-07 20:36:44.454608', '2027-07-15');
INSERT INTO public.items VALUES (448, 'ITM-00448', 'KANTONG UK 25', 1, 10, 10.00, 5.00, 12000.00, 'Active', '2026-11-07 20:36:44.456904', NULL);
INSERT INTO public.items VALUES (449, 'ITM-00449', 'KAIN PEL', 3, 1, 10.00, 5.00, 55000.00, 'Active', '2026-11-07 20:36:44.458634', NULL);
INSERT INTO public.items VALUES (450, 'ITM-00450', 'MIE UDON', 1, 1, 10.00, 5.00, 4900.00, 'Active', '2026-11-07 20:36:44.461465', NULL);
INSERT INTO public.items VALUES (451, 'ITM-00451', 'PASTA PANDAN', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.463462', NULL);
INSERT INTO public.items VALUES (452, 'ITM-00452', 'PASTA KACANG MERAH', 1, 1, 10.00, 5.00, 12500.00, 'Active', '2026-11-07 20:36:44.465795', NULL);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications VALUES (1, NULL, 'Petugas Gudang', 'Pengajuan PR Disetujui', 'Permintaan Pembelian PR-2026-001 telah disetujui oleh Supervisor Accounting. PO diterbitkan.', 'SUCCESS', '/permintaan-pembelian', false, '2026-11-02 17:09:53.901561');
INSERT INTO public.notifications VALUES (2, NULL, 'Petugas Gudang', 'Peringatan Stok Gudang', 'Stok Mozzarella Cheese Block di Gudang Dangau tersisa 5 KG (Mendekati batas minimum).', 'WARNING', '/dashboard', false, '2026-11-02 17:55:53.907244');
INSERT INTO public.notifications VALUES (3, NULL, 'Petugas Gudang', 'Jadwal Stock Opname', 'Stock Opname triwulan gudang utama telah dijadwalkan. Silakan periksa daftar fisik barang.', 'INFO', '/stok-opname', false, '2026-11-02 17:38:53.908985');
INSERT INTO public.notifications VALUES (4, NULL, 'Admin', 'PR Baru Membutuhkan Review', 'Petugas Gudang mengajukan restock bahan makanan & maintenance untuk Gudang Dangau.', 'PR', '/permintaan-pembelian', false, '2026-11-02 17:30:53.910107');
INSERT INTO public.notifications VALUES (5, NULL, 'Admin', 'Peringatan Stok Kritis', 'Item Semen Gresik 40kg tersisa 25 Sak (di bawah stok minimum 100 Sak). Disarankan order restock.', 'WARNING', '/pesanan-pembelian', false, '2026-11-02 16:31:53.911708');
INSERT INTO public.notifications VALUES (6, NULL, 'Admin', 'Laporan Barang Keluar', 'Pengeluaran barang GI-2026-002 untuk Outlet Resto telah berhasil diproses.', 'INFO', '/barang-keluar', false, '2026-11-02 16:58:53.913601');
INSERT INTO public.notifications VALUES (12, NULL, 'Admin', 'Penerimaan Barang Masuk', 'Admin Accounting mencatat Barang Masuk GR-20261102-0006. Stok telah otomatis diperbarui.', 'RECEIPT', '/barang-masuk', false, '2026-11-02 18:34:34.258672');
INSERT INTO public.notifications VALUES (14, NULL, 'Admin', 'Pengeluaran Barang (OUT)', 'Pengeluaran OUT-20261102-0005 untuk Warung Dangau telah dicatat oleh Admin Accounting.', 'ISSUE', '/barang-keluar', false, '2026-11-02 18:34:34.282681');
INSERT INTO public.notifications VALUES (16, NULL, 'Admin', 'Penerimaan Barang Masuk', 'Admin Accounting mencatat Barang Masuk GR-20261102-0007. Stok telah otomatis diperbarui.', 'RECEIPT', '/barang-masuk', false, '2026-11-02 18:35:36.257731');
INSERT INTO public.notifications VALUES (18, NULL, 'Admin', 'Pengeluaran Barang (OUT)', 'Pengeluaran OUT-20261102-0006 untuk Warung Dangau telah dicatat oleh Admin Accounting.', 'ISSUE', '/barang-keluar', false, '2026-11-02 18:35:36.277236');
INSERT INTO public.notifications VALUES (20, NULL, 'Admin', 'Stock Opname Selesai', 'Stock Opname SO-2026-002 selesai diinput oleh Admin Accounting. Penyesuaian stok telah diterapkan.', 'OPNAME', '/stok-opname', false, '2026-11-02 18:35:36.290341');
INSERT INTO public.notifications VALUES (24, NULL, 'Admin', 'Penerimaan Barang Masuk', 'Accounting Manager (Master) mencatat Barang Masuk GR-20261107-0008. Stok telah otomatis diperbarui.', 'RECEIPT', '/barang-masuk', false, '2026-11-07 13:35:15.013418');
INSERT INTO public.notifications VALUES (26, NULL, 'Admin', 'Pengeluaran Barang (OUT)', 'Pengeluaran OUT-20261107-0007 untuk Resto Dangau telah dicatat oleh Accounting Manager (Master).', 'ISSUE', '/barang-keluar', false, '2026-11-07 13:35:15.043327');
INSERT INTO public.notifications VALUES (7, NULL, 'Master', 'Ringkasan Aktivitas Gudang', 'Laporan pergerakan stok harian untuk seluruh gudang Dangau Hotel telah diperbarui.', 'INFO', '/dashboard', true, '2026-11-02 16:25:53.915942');
INSERT INTO public.notifications VALUES (8, NULL, 'Master', 'Persetujuan Pengadaan Terkini', 'Supervisor Accounting menyetujui PO pengadaan logistik berkala.', 'SUCCESS', '/pesanan-pembelian', true, '2026-11-02 16:27:53.917779');
INSERT INTO public.notifications VALUES (9, NULL, 'Master', 'Audit Stok & Selisih Opname', 'Hasil Stock Opname berkala tersedia untuk ditinjau pada laporan audit master.', 'INFO', '/stok-opname', true, '2026-11-02 16:55:53.91902');
INSERT INTO public.notifications VALUES (10, NULL, 'ALL', 'Peringatan Stok Menipis: Semen Gresik 40kg', 'Sisa stok Semen Gresik 40kg di Gudang Rumah Bos tersisa 80 unit (Batas minimum: 100 unit).', 'WARNING', '/dashboard', true, '2026-11-02 18:15:27.049683');
INSERT INTO public.notifications VALUES (11, NULL, 'ALL', 'Peringatan Stok Menipis: Pipa PVC AW 4" Wavin', 'Sisa stok Pipa PVC AW 4" Wavin di Gudang Rumah Bos tersisa 23 unit (Batas minimum: 30 unit).', 'WARNING', '/dashboard', true, '2026-11-02 18:15:27.053677');
INSERT INTO public.notifications VALUES (13, NULL, 'Master', 'Barang Masuk Dicatat', 'Penerimaan Barang GR-20261102-0006 telah selesai diproses di gudang.', 'RECEIPT', '/barang-masuk', true, '2026-11-02 18:34:34.262978');
INSERT INTO public.notifications VALUES (15, NULL, 'Master', 'Pengeluaran Barang Dicatat', 'Distribusi barang OUT-20261102-0005 untuk Warung Dangau selesai diproses.', 'ISSUE', '/barang-keluar', true, '2026-11-02 18:34:34.284161');
INSERT INTO public.notifications VALUES (17, NULL, 'Master', 'Barang Masuk Dicatat', 'Penerimaan Barang GR-20261102-0007 telah selesai diproses di gudang.', 'RECEIPT', '/barang-masuk', true, '2026-11-02 18:35:36.261972');
INSERT INTO public.notifications VALUES (19, NULL, 'Master', 'Pengeluaran Barang Dicatat', 'Distribusi barang OUT-20261102-0006 untuk Warung Dangau selesai diproses.', 'ISSUE', '/barang-keluar', true, '2026-11-02 18:35:36.278693');
INSERT INTO public.notifications VALUES (21, NULL, 'Master', 'Laporan Stock Opname', 'Audit fisik stok SO-2026-002 telah diselesaikan. Laporan audit tersedia untuk ditinjau.', 'OPNAME', '/stok-opname', true, '2026-11-02 18:35:36.291581');
INSERT INTO public.notifications VALUES (22, NULL, 'ALL', 'Peringatan Stok Menipis: Semen Gresik 40kg', 'Sisa stok Semen Gresik 40kg di Gudang Rumah Bos tersisa 80 unit (Batas minimum: 100 unit).', 'WARNING', '/dashboard', true, '2026-11-07 11:23:15.865095');
INSERT INTO public.notifications VALUES (23, NULL, 'ALL', 'Peringatan Stok Menipis: Pipa PVC AW 4" Wavin', 'Sisa stok Pipa PVC AW 4" Wavin di Gudang Rumah Bos tersisa 23 unit (Batas minimum: 30 unit).', 'WARNING', '/dashboard', true, '2026-11-07 11:23:15.88484');
INSERT INTO public.notifications VALUES (25, NULL, 'Master', 'Barang Masuk Dicatat', 'Penerimaan Barang GR-20261107-0008 telah selesai diproses di gudang.', 'RECEIPT', '/dashboard', true, '2026-11-07 13:35:15.018278');
INSERT INTO public.notifications VALUES (27, NULL, 'Master', 'Pengeluaran Barang Dicatat', 'Distribusi barang OUT-20261107-0007 untuk Resto Dangau selesai diproses.', 'ISSUE', '/dashboard', true, '2026-11-07 13:35:15.044385');
INSERT INTO public.notifications VALUES (28, NULL, 'ALL', 'Peringatan Stok Menipis: Semen Gresik 40kg', 'Sisa stok Semen Gresik 40kg di Gudang Rumah Bos tersisa 80 unit (Batas minimum: 100 unit).', 'WARNING', '/dashboard', true, '2026-11-07 19:51:40.988112');
INSERT INTO public.notifications VALUES (29, NULL, 'ALL', 'Peringatan Stok Menipis: Pipa PVC AW 4" Wavin', 'Sisa stok Pipa PVC AW 4" Wavin di Gudang Rumah Bos tersisa 23 unit (Batas minimum: 30 unit).', 'WARNING', '/dashboard', true, '2026-11-07 19:51:40.992134');
INSERT INTO public.notifications VALUES (30, NULL, 'ALL', 'Peringatan Stok Menipis: AJINOMOTO 500 GRAM  (24)', 'Sisa stok AJINOMOTO 500 GRAM  (24) di Gudang White House tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-07 20:34:15.281786');
INSERT INTO public.notifications VALUES (31, NULL, 'ALL', 'Peringatan Stok Menipis: ALAS NASI 20X20', 'Sisa stok ALAS NASI 20X20 di Gudang Dangau tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-07 20:34:15.284518');
INSERT INTO public.notifications VALUES (32, NULL, 'ALL', 'Peringatan Stok Menipis: AJINOMOTO 500 GRAM  (24)', 'Sisa stok AJINOMOTO 500 GRAM  (24) di Gudang White House tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-08 11:44:04.709678');
INSERT INTO public.notifications VALUES (33, NULL, 'ALL', 'Peringatan Stok Menipis: ALAS NASI 20X20', 'Sisa stok ALAS NASI 20X20 di Gudang Dangau tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-08 11:44:04.753333');
INSERT INTO public.notifications VALUES (34, NULL, 'Admin', 'PR Baru Membutuhkan Review', 'Permintaan Pembelian PR-2026-002 diajukan oleh Accounting Manager (Master) dan menunggu persetujuan.', 'PR', '/permintaan-pembelian', false, '2026-11-08 14:45:28.167812');
INSERT INTO public.notifications VALUES (35, NULL, 'Master', 'Pengajuan PR Baru', 'Permintaan Pembelian PR-2026-002 diajukan untuk gudang dan menunggu review Accounting.', 'PR', '/dashboard', false, '2026-11-08 14:45:28.172149');
INSERT INTO public.notifications VALUES (36, NULL, 'ALL', 'Peringatan Stok Menipis: AJINOMOTO 500 GRAM  (24)', 'Sisa stok AJINOMOTO 500 GRAM  (24) di Gudang White House tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-23 10:42:36.37069');
INSERT INTO public.notifications VALUES (37, NULL, 'ALL', 'Peringatan Stok Menipis: ALAS NASI 20X20', 'Sisa stok ALAS NASI 20X20 di Gudang Dangau tersisa 0 unit (Batas minimum: 10 unit).', 'WARNING', '/dashboard', false, '2026-11-23 10:42:36.377468');
INSERT INTO public.notifications VALUES (38, NULL, 'Petugas Gudang', 'Harga Barang Masuk Telah Diisi', 'Admin Accounting (Accounting Supervisor (Admin)) telah menginput harga untuk GR-202611-0004 (Total: Rp 290.000).', 'RECEIPT', '/barang-masuk', false, '2026-11-23 11:19:59.182158');
INSERT INTO public.notifications VALUES (39, NULL, 'Petugas Gudang', 'Harga Barang Masuk Telah Diisi', 'Admin Accounting (Accounting Supervisor (Admin)) telah menginput harga untuk GR-202611-0005 (Total: Rp 925.000).', 'RECEIPT', '/barang-masuk', false, '2026-11-23 11:39:21.362969');
INSERT INTO public.notifications VALUES (40, NULL, 'ALL', 'Peringatan Stok Menipis: AJINOMOTO 500 GRAM  (24)', 'Sisa stok AJINOMOTO 500 GRAM  (24) di Gudang White House tersisa 0 unit (Batas minimum: 15 unit).', 'WARNING', '/dashboard', false, '2026-11-24 09:06:12.548984');
INSERT INTO public.notifications VALUES (41, NULL, 'ALL', 'Peringatan Stok Menipis: ALAS NASI 20X20', 'Sisa stok ALAS NASI 20X20 di Gudang Dangau tersisa 0 unit (Batas minimum: 25 unit).', 'WARNING', '/dashboard', false, '2026-11-24 09:06:12.557413');
INSERT INTO public.notifications VALUES (42, NULL, 'ALL', 'Peringatan Stok Menipis: AJINOMOTO 500 GRAM  (24)', 'Sisa stok AJINOMOTO 500 GRAM  (24) di Gudang White House tersisa 0 unit (Batas minimum: 15 unit).', 'WARNING', '/dashboard', false, '2026-11-27 05:02:19.373312');
INSERT INTO public.notifications VALUES (43, NULL, 'ALL', 'Peringatan Stok Menipis: ALAS NASI 20X20', 'Sisa stok ALAS NASI 20X20 di Gudang Dangau tersisa 0 unit (Batas minimum: 25 unit).', 'WARNING', '/dashboard', false, '2026-11-27 05:02:19.378203');
INSERT INTO public.notifications VALUES (44, NULL, 'Petugas Gudang', 'Pengajuan PR Disetujui', 'Permintaan Pembelian PR-2026-002 telah DISETUJUI oleh Admin Accounting. Diterbitkan sebagai PO-2026-0002.', 'SUCCESS', '/permintaan-pembelian', false, '2026-11-27 05:23:39.66246');
INSERT INTO public.notifications VALUES (45, NULL, 'Master', 'PR Disetujui & PO Diterbitkan', 'Supervisor Accounting telah menyetujui PR-2026-002 dan menerbitkan pesanan PO-2026-0002.', 'SUCCESS', '/dashboard', false, '2026-11-27 05:23:39.664984');
INSERT INTO public.notifications VALUES (46, NULL, 'Admin', 'PR Baru Membutuhkan Review', 'Permintaan Pembelian PR-2026-003 diajukan oleh Budi Santoso (Petugas Gudang) dan menunggu persetujuan.', 'PR', '/permintaan-pembelian', false, '2026-11-27 05:43:25.035383');
INSERT INTO public.notifications VALUES (47, NULL, 'Master', 'Pengajuan PR Baru', 'Permintaan Pembelian PR-2026-003 diajukan untuk gudang dan menunggu review Accounting.', 'PR', '/dashboard', false, '2026-11-27 05:43:25.041138');
INSERT INTO public.notifications VALUES (48, NULL, 'Petugas Gudang', 'Pengajuan PR Disetujui', 'Permintaan Pembelian PR-2026-003 telah DISETUJUI oleh Admin Accounting. Diterbitkan sebagai PO-2026-0003.', 'SUCCESS', '/permintaan-pembelian', false, '2026-11-27 05:43:45.675595');
INSERT INTO public.notifications VALUES (49, NULL, 'Master', 'PR Disetujui & PO Diterbitkan', 'Supervisor Accounting telah menyetujui PR-2026-003 dan menerbitkan pesanan PO-2026-0003.', 'SUCCESS', '/dashboard', false, '2026-11-27 05:43:45.682681');


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_order_items VALUES (1, 1, 11, 20.00, 17250.00, 345000.00);
INSERT INTO public.purchase_order_items VALUES (2, 1, 1, 10.00, 25750.00, 257500.00);
INSERT INTO public.purchase_order_items VALUES (3, 2, 2, 10.00, 350.00, 3500.00);
INSERT INTO public.purchase_order_items VALUES (4, 3, 157, 1.00, 9500.00, 9500.00);


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_orders VALUES (1, 'PO-202611-0001', 1, 2, 1, '2026-11-06', 'Disetujui', 602500.00, 'Pengadaan bahan baku resto Dangau', 2, '2026-11-07 20:36:44.47655');
INSERT INTO public.purchase_orders VALUES (2, 'PO-2026-0002', 2, 1, 1, '2026-11-27', 'Diproses', 3500.00, 'Permintaan pengadaan prioritas Sedang', 2, '2026-11-27 05:23:39.643699');
INSERT INTO public.purchase_orders VALUES (3, 'PO-2026-0003', 3, 1, 1, '2026-11-27', 'Diproses', 9500.00, 'Pengadaan 1 barang persediaan (Prioritas: Urgent)', 2, '2026-11-27 05:43:45.458815');


--
-- Data for Name: purchase_request_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_request_items VALUES (1, 1, 11, 20.00, 'Normal', 'Disetujui');
INSERT INTO public.purchase_request_items VALUES (2, 1, 1, 10.00, 'Tinggi', 'Disetujui');
INSERT INTO public.purchase_request_items VALUES (3, 2, 2, 10.00, 'Sedang', 'Disetujui');
INSERT INTO public.purchase_request_items VALUES (4, 3, 157, 1.00, 'Urgent', 'Disetujui');


--
-- Data for Name: purchase_requests; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_requests VALUES (1, 'PR-202611-0001', 3, 1, 'Disetujui', 'Restock rutin bahan pokok resto dan amenities', '2026-11-05 20:36:44.47015', NULL);
INSERT INTO public.purchase_requests VALUES (2, 'PR-2026-002', 1, 1, 'Disetujui', 'Permintaan pengadaan prioritas Sedang', '2026-11-08 14:45:28.155217', NULL);
INSERT INTO public.purchase_requests VALUES (3, 'PR-2026-003', 3, 1, 'Disetujui', 'Pengadaan 1 barang persediaan (Prioritas: Urgent)', '2026-11-27 05:43:24.932087', NULL);


--
-- Data for Name: role_visibilities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_visibilities VALUES (1, 1, true, true, true, true, true, '2026-11-07 13:24:02.535687');
INSERT INTO public.role_visibilities VALUES (3, 3, true, true, true, false, true, '2026-11-07 20:45:43.491387');
INSERT INTO public.role_visibilities VALUES (2, 2, true, true, true, true, true, '2026-11-07 20:45:43.484306');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.roles VALUES (1, 'Master');
INSERT INTO public.roles VALUES (2, 'Admin');
INSERT INTO public.roles VALUES (3, 'Petugas Gudang');


--
-- Data for Name: stock_opname_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: stock_opnames; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.suppliers VALUES (1, 'PT Mitra Bangunan Abadi', '0812-3456-7890', 'Jl. Arteri Supadio No. 88, Kubu Raya', 'Active', '2026-10-07 14:52:47.761333');
INSERT INTO public.suppliers VALUES (2, 'Distributor Utama F&B', '0813-9988-7766', 'Jl. Ahmad Yani No. 12, Pontianak', 'Active', '2026-10-07 14:52:47.761333');
INSERT INTO public.suppliers VALUES (3, 'PT Tirta Makmur', '0811-2233-4455', 'Jl. Gajah Mada No. 45, Pontianak', 'Active', '2026-10-07 14:52:47.761333');
INSERT INTO public.suppliers VALUES (4, 'PT Elektro Maju Jaya', '0852-1122-3344', 'Jl. Imam Bonjol No. 9, Pontianak', 'Active', '2026-10-07 14:52:47.761333');


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.units VALUES (1, 'PCS');
INSERT INTO public.units VALUES (2, 'Box');
INSERT INTO public.units VALUES (3, 'KG');
INSERT INTO public.units VALUES (4, 'Btg');
INSERT INTO public.units VALUES (5, 'Sak');
INSERT INTO public.units VALUES (6, 'Pail');
INSERT INTO public.units VALUES (7, 'Roll');
INSERT INTO public.units VALUES (8, 'Btl');
INSERT INTO public.units VALUES (9, 'Dus');
INSERT INTO public.units VALUES (10, 'Pack');
INSERT INTO public.units VALUES (11, 'Bks');
INSERT INTO public.units VALUES (12, 'Klg');
INSERT INTO public.units VALUES (13, 'Ken');
INSERT INTO public.units VALUES (14, 'Krg');
INSERT INTO public.units VALUES (15, 'Psg');
INSERT INTO public.units VALUES (16, 'Lsn');
INSERT INTO public.units VALUES (17, 'Ktk');
INSERT INTO public.units VALUES (18, 'Lbr');
INSERT INTO public.units VALUES (19, 'Slop');
INSERT INTO public.units VALUES (20, 'Set');
INSERT INTO public.units VALUES (21, 'Unit');
INSERT INTO public.units VALUES (22, 'Can');
INSERT INTO public.units VALUES (23, 'Ball');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, 'Accounting Manager (Master)', 'master@dangau.com', '$2a$10$eFqFo03l6QDkTfV9yfZHbeBEu5bzrTAEGIqvVt5sZasXXYnKjfHzO', 1, 1, '2026-10-07 14:52:47.754475', NULL, true);
INSERT INTO public.users VALUES (2, 'Accounting Supervisor (Admin)', 'accounting@dangau.com', '$2a$10$eFqFo03l6QDkTfV9yfZHbeBEu5bzrTAEGIqvVt5sZasXXYnKjfHzO', 2, 1, '2026-10-07 14:52:47.754475', NULL, true);
INSERT INTO public.users VALUES (3, 'Budi Santoso (Petugas Gudang)', 'gudang@dangau.com', '$2a$10$eFqFo03l6QDkTfV9yfZHbeBEu5bzrTAEGIqvVt5sZasXXYnKjfHzO', 3, 1, '2026-10-07 14:52:47.754475', '+62 812-5509-8112', true);


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.warehouses VALUES (1, 'WH-DG', 'Gudang Dangau', 'Hotel Dangau Kubu Raya - Main Store', 'Active');
INSERT INTO public.warehouses VALUES (2, 'WH-WH', 'Gudang White House', 'Gudang White House / Kediaman Owner', 'Active');


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 41, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Name: goods_issue_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_issue_items_id_seq', 6, true);


--
-- Name: goods_issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_issues_id_seq', 4, true);


--
-- Name: goods_receipt_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_receipt_items_id_seq', 6, true);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.goods_receipts_id_seq', 6, true);


--
-- Name: inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_id_seq', 914, true);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 5, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.items_id_seq', 452, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 49, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 4, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 3, true);


--
-- Name: purchase_request_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_request_items_id_seq', 4, true);


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_requests_id_seq', 3, true);


--
-- Name: role_visibilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_visibilities_id_seq', 48, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: stock_opname_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_opname_items_id_seq', 1, false);


--
-- Name: stock_opnames_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_opnames_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 4, true);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.units_id_seq', 38, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 2, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_category_name_key UNIQUE (category_name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: goods_issue_items goods_issue_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_items
    ADD CONSTRAINT goods_issue_items_pkey PRIMARY KEY (id);


--
-- Name: goods_issues goods_issues_gi_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT goods_issues_gi_number_key UNIQUE (gi_number);


--
-- Name: goods_issues goods_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT goods_issues_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_items goods_receipt_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_gr_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_gr_number_key UNIQUE (gr_number);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: items items_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_sku_key UNIQUE (sku);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);


--
-- Name: purchase_request_items purchase_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_requests purchase_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_pkey PRIMARY KEY (id);


--
-- Name: purchase_requests purchase_requests_pr_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_pr_number_key UNIQUE (pr_number);


--
-- Name: role_visibilities role_visibilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_visibilities
    ADD CONSTRAINT role_visibilities_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: stock_opname_items stock_opname_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opname_items
    ADD CONSTRAINT stock_opname_items_pkey PRIMARY KEY (id);


--
-- Name: stock_opnames stock_opnames_opname_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opnames
    ADD CONSTRAINT stock_opnames_opname_number_key UNIQUE (opname_number);


--
-- Name: stock_opnames stock_opnames_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opnames
    ADD CONSTRAINT stock_opnames_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: inventory unique_item_warehouse; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT unique_item_warehouse UNIQUE (item_id, warehouse_id);


--
-- Name: role_visibilities unique_role_visibility; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_visibilities
    ADD CONSTRAINT unique_role_visibility UNIQUE (role_id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: units units_unit_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_unit_name_key UNIQUE (unit_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_warehouse_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_warehouse_code_key UNIQUE (warehouse_code);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: goods_issue_items goods_issue_items_goods_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_items
    ADD CONSTRAINT goods_issue_items_goods_issue_id_fkey FOREIGN KEY (goods_issue_id) REFERENCES public.goods_issues(id) ON DELETE CASCADE;


--
-- Name: goods_issue_items goods_issue_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issue_items
    ADD CONSTRAINT goods_issue_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: goods_issues goods_issues_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT goods_issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: goods_issues goods_issues_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_issues
    ADD CONSTRAINT goods_issues_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: goods_receipt_items goods_receipt_items_goods_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_goods_receipt_id_fkey FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id) ON DELETE CASCADE;


--
-- Name: goods_receipt_items goods_receipt_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: goods_receipts goods_receipts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL;


--
-- Name: goods_receipts goods_receipts_price_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_price_verified_by_fkey FOREIGN KEY (price_verified_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: goods_receipts goods_receipts_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inventory inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: inventory_movements inventory_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: inventory_movements inventory_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inventory inventory_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: items items_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_purchase_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: purchase_orders purchase_orders_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: purchase_request_items purchase_request_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: purchase_request_items purchase_request_items_purchase_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id) ON DELETE CASCADE;


--
-- Name: purchase_requests purchase_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: purchase_requests purchase_requests_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: role_visibilities role_visibilities_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_visibilities
    ADD CONSTRAINT role_visibilities_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: stock_opname_items stock_opname_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opname_items
    ADD CONSTRAINT stock_opname_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: stock_opname_items stock_opname_items_stock_opname_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opname_items
    ADD CONSTRAINT stock_opname_items_stock_opname_id_fkey FOREIGN KEY (stock_opname_id) REFERENCES public.stock_opnames(id) ON DELETE CASCADE;


--
-- Name: stock_opnames stock_opnames_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opnames
    ADD CONSTRAINT stock_opnames_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stock_opnames stock_opnames_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_opnames
    ADD CONSTRAINT stock_opnames_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: users users_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


