begin;

alter table succursale_saq add column creation_time timestamp;
alter table succursale_saq add column creation_user text;
alter table succursale_saq add column last_update_time timestamp;
alter table succursale_saq add column last_update_user text;

alter table representant add column creation_time timestamp;
alter table representant add column creation_user text;
alter table representant add column last_update_time timestamp;
alter table representant add column last_update_user text;

alter table timbre_restaurateur add column creation_time timestamp;
alter table timbre_restaurateur add column creation_user text;
alter table timbre_restaurateur add column last_update_time timestamp;
alter table timbre_restaurateur add column last_update_user text;

alter table client add column creation_time timestamp;
alter table client add column creation_user text;
alter table client add column last_update_time timestamp;
alter table client add column last_update_user text;

alter table producteur add column creation_time timestamp;
alter table producteur add column creation_user text;
alter table producteur add column last_update_time timestamp;
alter table producteur add column last_update_user text;

alter table produit add column creation_time timestamp;
alter table produit add column creation_user text;
alter table produit add column last_update_time timestamp;
alter table produit add column last_update_user text;

alter table client_produit add column creation_time timestamp;
alter table client_produit add column creation_user text;
alter table client_produit add column last_update_time timestamp;
alter table client_produit add column last_update_user text;

alter table commande add column creation_time timestamp;
alter table commande add column creation_user text;
alter table commande add column last_update_time timestamp;
alter table commande add column last_update_user text;

alter table commande_item add column creation_time timestamp;
alter table commande_item add column creation_user text;
alter table commande_item add column last_update_time timestamp;
alter table commande_item add column last_update_user text;

alter table inventaire add column creation_time timestamp;
alter table inventaire add column creation_user text;
alter table inventaire add column last_update_time timestamp;
alter table inventaire add column last_update_user text;

alter table backorder add column creation_time timestamp;
alter table backorder add column creation_user text;
alter table backorder add column last_update_time timestamp;
alter table backorder add column last_update_user text;

alter table usager add column creation_time timestamp;
alter table usager add column creation_user text;
alter table usager add column last_update_time timestamp;
alter table usager add column last_update_user text;

-- alter table commande drop column creation_time;
-- alter table commande drop column creation_user;
-- alter table commande drop column last_update_time;
-- alter table commande drop column last_update_user;


create or replace function logging_trigger() returns trigger as $$
    begin
        if tg_op = 'INSERT' then
	    new.creation_time := current_timestamp;
	    new.creation_user := current_user;
	end if;
	if tg_op = 'INSERT' or tg_op = 'UPDATE' then
  	    new.last_update_time := current_timestamp;
	    new.last_update_user := current_user;
        end if;
        return new;
    end;
$$ language plpgsql;

drop trigger if exists logging_trigger on succursale_saq;
create trigger logging_trigger before insert or update on succursale_saq for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on representant;
create trigger logging_trigger before insert or update on representant for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on timbre_restaurateur;
create trigger logging_trigger before insert or update on timbre_restaurateur for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on client;
create trigger logging_trigger before insert or update on client for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on producteur;
create trigger logging_trigger before insert or update on producteur for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on produit;
create trigger logging_trigger before insert or update on produit for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on client_produit;
create trigger logging_trigger before insert or update on client_produit for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on commande;
create trigger logging_trigger before insert or update on commande for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on commande_item;
create trigger logging_trigger before insert or update on commande_item for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on inventaire;
create trigger logging_trigger before insert or update on inventaire for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on backorder;
create trigger logging_trigger before insert or update on backorder for each row execute procedure logging_trigger();

drop trigger if exists logging_trigger on usager;
create trigger logging_trigger before insert or update on usager for each row execute procedure logging_trigger();

--rollback;
commit;
