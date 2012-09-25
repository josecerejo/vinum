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
    representant text,
    expedition text,
    no_succursale text,
    note text,
    no_client_saq text,
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
);

drop table if exists commande cascade;
create table commande (
    no_commande_facture serial primary key,    
    ancien_no_commande_facture integer,
    no_client integer,
    date_commande date,
    expedition text,
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
    jour_livraison text
);

drop table if exists commande_produit cascade;
create table commande_produit (
    commande_produit_id serial primary key,
    no_commande_facture integer,
    no_produit_interne integer,
    no_produit_saq integer,
    no_commande_saq text,
    quantite_caisse integer,
    quantite_bouteille integer,
    statut text,
    no_client integer,
    montant_commission numeric,
    date_commande date, -- ??
    suc_num integer
);

drop table if exists inventaire cascade;
create table inventaire (
    no_inventaire serial primary key,
    no_produit_interne integer,
    no_produit_saq integer,
    no_commande_saq text,
    quantite_commandee integer,
    quantite_recue integer,
    date_commande date,
    date_recue date,
    prix_coutant numeric,
    millesime integer,
    commission numeric,
    statut text,
    solde numeric,
    solde_30_jours numeric,
    solde_60_jours numeric,
    suc_num integer           
);