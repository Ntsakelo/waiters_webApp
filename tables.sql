
CREATE TABLE working_days (
    id serial primary key not null,
    week_day text not null  
);

CREATE TABLE waiters_names (
    id serial primary key not null,
    firstName text not null
);
CREATE TABLE waiters_schedule(
   id serial primary key not null,
   name_id int not null,
   day_id int not null,
   foreign key (name_id) references waiters_names(id) on delete cascade,
   foreign key (day_id) references working_days(id) on delete cascade
);

INSERT INTO working_days (week_day) VALUES ('Monday');
INSERT INTO working_days (week_day) VALUES ('Tuesday');
INSERT INTO working_days (week_day) VALUES ('Wednesday');
INSERT INTO working_days (week_day) VALUES ('Thursday');
INSERT INTO working_days (week_day) VALUES ('Friday');
INSERT INTO working_days (week_day) VALUES ('Saturday');
INSERT INTO working_days (week_day) VALUES ('Sunday');