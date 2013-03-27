delete from usager;


-- admin full-privilege role and users

drop owned by admin_role;
drop role if exists admin_role;
create role admin_role;
grant all on all tables in schema public to admin_role;

insert into usager (usager_nom, mdp_hash) values ('x', (select crypt('x', gen_salt('bf'))));
drop role if exists x;
create role x;
grant admin_role to x;

-- representant group role and users (only granted select privilege)

drop owned by representant_role;
drop role if exists representant_role;
create role representant_role;
revoke all privileges on all tables in schema public from representant_role;
grant select on all tables in schema public to representant_role;

insert into usager (usager_nom, mdp_hash, representant_id) values ('y', (select crypt('y', gen_salt('bf'))), 2);
drop role if exists y;
create role y;
grant representant_role to y;
