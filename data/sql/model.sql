drop table if exists representant cascade;
create table representant (
    representant_id serial primary key,
    representant_nom text
);

insert into representant values (2, 'David Doucet');
insert into representant values (4, 'Nicolas Giroux');
insert into representant values (7, 'Jocelyn Racicot');
insert into representant values (13, 'François Lachapelle');
insert into representant values (18, 'Annie-C. Gaudreau');
insert into representant values (19, 'André Baillargeon');
insert into representant values (20, 'Steve Fradette');
insert into representant values (22, 'Alain Doucet');
insert into representant values (23, 'Caroline Chouinard');
insert into representant values (25, 'Patricia Morin');
insert into representant values (27, 'Inactif');
insert into representant values (29, 'bureau');

drop table if exists client cascade;
create table client (
    no_client serial primary key,
    ancien_no_client integer,
    nom_social text,
    no_civique text,
    rue text,
    ville text,
    province text,
    code_postal text,
    nom_responsable text,
    no_tel text,
    no_fax text,
    no_tel_personnel text,
    no_cellulaire text,
    courriel text,
    type_client text,
    specialite text,
    representant_id integer,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale text,
    note text,
    no_client_saq integer,
    no_civique_fact text,
    rue_fact text,
    ville_fact text,
    province_fact text,
    code_postal_fact text,
    suc_num text,
    jours_livraison text,
    date_ouverture_dossier date,
    jour_livraison text    
);

drop table if exists produit cascade;
create table produit (
    no_produit_interne serial primary key,
    ancien_no_produit integer,
    no_producteur integer,
    nom_producteur text,
    type_vin text,
    nom_domaine text,
    format_id integer,
    format text,
    couleur text,
    quantite_par_caisse integer,
    pays text,
    suc_num integer
    --locked_by_user text
);

drop table if exists client_produit cascade;
create table client_produit (
    client_produit_id serial primary key,
    no_client integer not null,
    no_produit_interne integer not null,
    suc_num integer
);

drop table if exists commande cascade;
create table commande (
    no_commande_facture serial primary key,    
    ancien_no_commande_facture integer,
    no_client integer not null,
    date_commande date,
    expedition text check (expedition in ('direct', 'pickup', 'succursale')),
    no_succursale integer,
    date_pickup date,
    date_direct date,
    date_envoi date,
    statut_commande text,
    sous_total numeric,
    montant numeric,
    tps numeric,
    tvq numeric,
    statut_facture text,
    note text,
    suc_num integer,
    jour_livraison text,
    courriel_est_envoye bool,
    bon_de_commande_est_envoye bool
);

drop table if exists commande_produit cascade;
create table commande_produit (
    commande_produit_id serial primary key,
    no_commande_facture integer not null,
    no_produit_interne integer not null,
    no_produit_saq integer,
    no_commande_saq text, -- ?? should it be in commande?
    quantite_caisse integer,
    quantite_bouteille integer,
    statut text check (statut in ('OK', 'BO')),
    no_client integer,
    commission numeric, -- added
    montant_commission numeric,
    date_commande date, -- ??
    suc_num integer
);

drop table if exists inventaire cascade;
create table inventaire (
    no_inventaire serial primary key,
    no_produit_interne integer not null,
    no_produit_saq integer,
    no_commande_saq text,
    quantite_commandee integer,
    quantite_recue integer,
    date_commande date,
    date_recue date,
    prix_coutant numeric,
    millesime integer,
    commission numeric,
    statut text check (statut in ('en attente', 'en réserve', 'actif', 'inactif')),
    solde integer, -- en # de bouteilles
    solde_30_jours numeric,
    solde_60_jours numeric,
    suc_num integer           
);

drop table if exists succursale_saq cascade;
create table succursale_saq (
    succursale_saq_id serial primary key,
    no_succursale text not null,
    adresse text,
    ville text
);

--insert into inventaire (no_produit_interne, no_produit_saq, no_commande_saq, date_commande, millesime, statut, solde) values (178, -1, -1, '2000-01-01', 2000, 'Actif', 23);
--update produit set locked_by_user = 'test' where type_vin like 'AUS%';