--
-- PostgreSQL database dump
--

\restrict 0eeCkMwVXc5SfA2WOsp97e3MXWMJBNQcSfcmLzl9Yet6nbfK4zfNLBW6AsPs0hV

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: InscricaoStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InscricaoStatus" AS ENUM (
    'PENDENTE',
    'ANALISANDO',
    'APROVADA',
    'RECUSADA'
);


--
-- Name: TipoAtualizacao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoAtualizacao" AS ENUM (
    'TEXTO',
    'FOTO',
    'VIDEO',
    'COMPROVANTE'
);


--
-- Name: VaquinhaStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VaquinhaStatus" AS ENUM (
    'ATIVA',
    'ENCERRADA'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Atualizacao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Atualizacao" (
    id text NOT NULL,
    "vaquinhaId" text NOT NULL,
    conteudo text NOT NULL,
    tipo public."TipoAtualizacao" NOT NULL,
    "imagemUrl" text,
    "videoUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Config" (
    id text NOT NULL,
    biografia text NOT NULL,
    "avatarUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bannerAtivo" boolean DEFAULT false NOT NULL,
    "bannerLink" text,
    "bannerTexto" text,
    "vaquinhaFixadaId" text,
    "bannerImageUrl" text,
    "googleAnalyticsId" text,
    "googleAdSenseId" text,
    "adsAtivado" boolean DEFAULT false NOT NULL
);


--
-- Name: Denuncia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Denuncia" (
    id text NOT NULL,
    "perfilFalso" text NOT NULL,
    plataforma text NOT NULL,
    descricao text NOT NULL,
    contato text,
    status text DEFAULT 'PENDENTE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imagemUrl" text
);


--
-- Name: FAQ; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FAQ" (
    id text NOT NULL,
    pergunta text NOT NULL,
    resposta text NOT NULL,
    ordem integer DEFAULT 0 NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imagemUrl" text,
    "videoUrl" text,
    "botaoLink" text,
    "botaoTexto" text
);


--
-- Name: FonteRenda; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FonteRenda" (
    id text NOT NULL,
    nome text NOT NULL,
    descricao text,
    percentual double precision
);


--
-- Name: Inscricao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Inscricao" (
    id text NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    telefone text,
    cidade text NOT NULL,
    estado text NOT NULL,
    historia text NOT NULL,
    situacao text NOT NULL,
    status public."InscricaoStatus" DEFAULT 'PENDENTE'::public."InscricaoStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    necessidade text[],
    "dataNascimento" timestamp(3) without time zone,
    "dataRealizacao" timestamp(3) without time zone,
    "faixaValor" text,
    "linkMidiaSocial" text,
    "nomeBeneficiado" text,
    "paraQuem" text
);


--
-- Name: LinkSocial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LinkSocial" (
    id text NOT NULL,
    nome text NOT NULL,
    url text NOT NULL,
    icone text,
    ordem integer DEFAULT 0 NOT NULL
);


--
-- Name: PerfilOficial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PerfilOficial" (
    id text NOT NULL,
    plataforma text NOT NULL,
    usuario text NOT NULL,
    url text NOT NULL,
    verificado boolean DEFAULT true NOT NULL
);


--
-- Name: PerfilSocial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PerfilSocial" (
    id text NOT NULL,
    nome text NOT NULL,
    descricao text,
    "avatarUrl" text,
    ordem integer DEFAULT 0 NOT NULL
);


--
-- Name: RedeSocial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RedeSocial" (
    id text NOT NULL,
    "perfilId" text NOT NULL,
    plataforma text NOT NULL,
    usuario text NOT NULL,
    url text NOT NULL,
    seguidores integer,
    ordem integer DEFAULT 0 NOT NULL,
    tipo text DEFAULT 'oficial'::text NOT NULL,
    "erroAtualizacao" text,
    "seguidoresAtualizadoEm" timestamp(3) without time zone
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    nome text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Vaquinha; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Vaquinha" (
    id text NOT NULL,
    titulo text NOT NULL,
    slug text NOT NULL,
    descricao text NOT NULL,
    "linkOriginal" text NOT NULL,
    "chavePix" text NOT NULL,
    "imagemUrl" text,
    meta double precision NOT NULL,
    "valorAtual" double precision DEFAULT 0 NOT NULL,
    doacoes integer DEFAULT 0 NOT NULL,
    coracoes integer DEFAULT 0 NOT NULL,
    status public."VaquinhaStatus" DEFAULT 'ATIVA'::public."VaquinhaStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "videoUrl" text
);


--
-- Name: VaquinhaApoiada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VaquinhaApoiada" (
    id text NOT NULL,
    nome text NOT NULL,
    link text NOT NULL,
    descricao text,
    "videoUrl" text
);


--
-- Data for Name: Atualizacao; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Atualizacao" (id, "vaquinhaId", conteudo, tipo, "imagemUrl", "videoUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: Config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Config" (id, biografia, "avatarUrl", "updatedAt", "bannerAtivo", "bannerLink", "bannerTexto", "vaquinhaFixadaId", "bannerImageUrl", "googleAnalyticsId", "googleAdSenseId", "adsAtivado") FROM stdin;
\.


--
-- Data for Name: Denuncia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Denuncia" (id, "perfilFalso", plataforma, descricao, contato, status, "createdAt", "imagemUrl") FROM stdin;
\.


--
-- Data for Name: FAQ; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FAQ" (id, pergunta, resposta, ordem, ativo, "createdAt", "updatedAt", "imagemUrl", "videoUrl", "botaoLink", "botaoTexto") FROM stdin;
\.


--
-- Data for Name: FonteRenda; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FonteRenda" (id, nome, descricao, percentual) FROM stdin;
\.


--
-- Data for Name: Inscricao; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inscricao" (id, nome, email, telefone, cidade, estado, historia, situacao, status, "createdAt", necessidade, "dataNascimento", "dataRealizacao", "faixaValor", "linkMidiaSocial", "nomeBeneficiado", "paraQuem") FROM stdin;
\.


--
-- Data for Name: LinkSocial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LinkSocial" (id, nome, url, icone, ordem) FROM stdin;
\.


--
-- Data for Name: PerfilOficial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PerfilOficial" (id, plataforma, usuario, url, verificado) FROM stdin;
\.


--
-- Data for Name: PerfilSocial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PerfilSocial" (id, nome, descricao, "avatarUrl", ordem) FROM stdin;
\.


--
-- Data for Name: RedeSocial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RedeSocial" (id, "perfilId", plataforma, usuario, url, seguidores, ordem, tipo, "erroAtualizacao", "seguidoresAtualizadoEm") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, nome, "createdAt") FROM stdin;
\.


--
-- Data for Name: Vaquinha; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Vaquinha" (id, titulo, slug, descricao, "linkOriginal", "chavePix", "imagemUrl", meta, "valorAtual", doacoes, coracoes, status, "createdAt", "updatedAt", "videoUrl") FROM stdin;
\.


--
-- Data for Name: VaquinhaApoiada; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VaquinhaApoiada" (id, nome, link, descricao, "videoUrl") FROM stdin;
\.


--
-- Name: Atualizacao Atualizacao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Atualizacao"
    ADD CONSTRAINT "Atualizacao_pkey" PRIMARY KEY (id);


--
-- Name: Config Config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_pkey" PRIMARY KEY (id);


--
-- Name: Denuncia Denuncia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Denuncia"
    ADD CONSTRAINT "Denuncia_pkey" PRIMARY KEY (id);


--
-- Name: FAQ FAQ_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FAQ"
    ADD CONSTRAINT "FAQ_pkey" PRIMARY KEY (id);


--
-- Name: FonteRenda FonteRenda_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FonteRenda"
    ADD CONSTRAINT "FonteRenda_pkey" PRIMARY KEY (id);


--
-- Name: Inscricao Inscricao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Inscricao"
    ADD CONSTRAINT "Inscricao_pkey" PRIMARY KEY (id);


--
-- Name: LinkSocial LinkSocial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LinkSocial"
    ADD CONSTRAINT "LinkSocial_pkey" PRIMARY KEY (id);


--
-- Name: PerfilOficial PerfilOficial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PerfilOficial"
    ADD CONSTRAINT "PerfilOficial_pkey" PRIMARY KEY (id);


--
-- Name: PerfilSocial PerfilSocial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PerfilSocial"
    ADD CONSTRAINT "PerfilSocial_pkey" PRIMARY KEY (id);


--
-- Name: RedeSocial RedeSocial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RedeSocial"
    ADD CONSTRAINT "RedeSocial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VaquinhaApoiada VaquinhaApoiada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VaquinhaApoiada"
    ADD CONSTRAINT "VaquinhaApoiada_pkey" PRIMARY KEY (id);


--
-- Name: Vaquinha Vaquinha_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Vaquinha"
    ADD CONSTRAINT "Vaquinha_pkey" PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Vaquinha_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Vaquinha_slug_key" ON public."Vaquinha" USING btree (slug);


--
-- Name: Atualizacao Atualizacao_vaquinhaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Atualizacao"
    ADD CONSTRAINT "Atualizacao_vaquinhaId_fkey" FOREIGN KEY ("vaquinhaId") REFERENCES public."Vaquinha"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Config Config_vaquinhaFixadaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_vaquinhaFixadaId_fkey" FOREIGN KEY ("vaquinhaFixadaId") REFERENCES public."Vaquinha"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RedeSocial RedeSocial_perfilId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RedeSocial"
    ADD CONSTRAINT "RedeSocial_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES public."PerfilSocial"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0eeCkMwVXc5SfA2WOsp97e3MXWMJBNQcSfcmLzl9Yet6nbfK4zfNLBW6AsPs0hV

