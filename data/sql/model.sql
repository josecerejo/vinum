drop table if exists client cascade;
drop table if exists produit cascade;

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
