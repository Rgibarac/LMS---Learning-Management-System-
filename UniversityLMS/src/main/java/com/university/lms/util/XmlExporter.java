package com.university.lms.util;

import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;
import jakarta.xml.bind.Marshaller;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.StringWriter;
import java.util.List;

import com.university.lms.entity.User;

public class XmlExporter {

    public static <T> String exportToXml(List<T> entities, Class<T> clazz) throws JAXBException {
        JAXBContext context = JAXBContext.newInstance(clazz);
        Marshaller marshaller = context.createMarshaller();
        marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

        StringWriter writer = new StringWriter();
        marshaller.marshal(new JAXBElementWrapper<>(entities), writer);
        return writer.toString();
    }

    public static String exportUsersToXml(List<User> users) throws JAXBException {
        return exportToXml(users, User.class);
    }
}

@XmlRootElement(name = "entities")
@XmlAccessorType(XmlAccessType.FIELD)
class JAXBElementWrapper<T> {
    @XmlElement(name = "entity")
    private List<T> entities;

    public JAXBElementWrapper() {}

    public JAXBElementWrapper(List<T> entities) {
        this.entities = entities;
    }

    public List<T> getEntities() {
        return entities;
    }

    public void setEntities(List<T> entities) {
        this.entities = entities;
    }
}